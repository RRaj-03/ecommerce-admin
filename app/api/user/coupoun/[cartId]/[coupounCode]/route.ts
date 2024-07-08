import prismadb from "@/lib/prismadb";
import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { cartId: string; coupounCode: string } }
) {
	try {
		const token = req.headers.get("authorization")?.slice(7) || "";
		if (token === "") {
			return NextResponse.json(
				{ message: "Token is required" },
				{ status: 400 }
			);
		}
		let User;
		try {
			User = await decode({
				token: token,
				secret: process.env.NEXTAUTH_SECRET!,
			});
		} catch (error) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		if (!User) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const user = await prismadb.user.findUnique({
			where: { email: User.email! },
		});
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		const { coupounCode } = params;
		if (!coupounCode) {
			return NextResponse.json(
				{ message: "Coupoun Code is required" },
				{ status: 400 }
			);
		}
		const cart = await prismadb.cart.findUnique({
			where: {
				id: params.cartId,
			},
		});
		if (!cart) {
			return NextResponse.json({ message: "Cart not found" }, { status: 404 });
		}

		const coupoun = await prismadb.coupouns.findUnique({
			where: {
				code: coupounCode,
			},
			include: {
				store: true,
			},
		});
		if (!coupoun) {
			return NextResponse.json(
				{ message: "Coupoun not found, Check the code again" },
				{ status: 404 }
			);
		}
		const newCart = await prismadb.cart.update({
			where: {
				id: params.cartId,
			},
			data: {
				coupoun: {
					disconnect: true,
				},
				discount: 0,
				total:
					parseFloat(String(cart.subtotal)) *
					(1 + parseFloat(String(coupoun.store.tax)) / 100),
			},
			include: {
				coupoun: true,
				products: {
					include: {
						category: true,
						color: true,
						size: true,
						images: true,
						filterItems: {
							include: {
								filterItem: {
									include: {
										filter: true,
									},
								},
							},
						},
					},
				},
			},
		});
		return NextResponse.json({
			message: "Coupoun Removed Successfully",
			data: newCart,
		});
	} catch (error) {
		console.log("[error Cart POST]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}

export async function POST(
	req: NextRequest,
	{ params }: { params: { cartId: string; coupounCode: string } }
) {
	try {
		const body = await req.json();
		const { token = "" } = body;
		if (token === "") {
			return NextResponse.json(
				{ message: "Token is required" },
				{ status: 400 }
			);
		}
		let User;
		try {
			User = await decode({
				token: token,
				secret: process.env.NEXTAUTH_SECRET!,
			});
		} catch (error) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		if (!User) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const user = await prismadb.user.findUnique({
			where: { email: User.email! },
		});
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		const { coupounCode } = params;
		if (!coupounCode) {
			return NextResponse.json(
				{ message: "Coupoun Code is required" },
				{ status: 400 }
			);
		}
		const cart = await prismadb.cart.findUnique({
			where: {
				id: params.cartId,
			},
		});
		if (!cart) {
			return NextResponse.json({ message: "Cart not found" }, { status: 404 });
		}
		if (parseFloat(String(cart.subtotal)) <= 0) {
			return NextResponse.json({ message: "Cart is empty" }, { status: 404 });
		}
		const coupoun = await prismadb.coupouns.findUnique({
			where: {
				code: coupounCode,
			},
			include: {
				store: true,
			},
		});
		if (!coupoun) {
			return NextResponse.json(
				{ message: "Coupoun not found, Check the code again" },
				{ status: 404 }
			);
		}
		if (coupoun.archived) {
			return NextResponse.json(
				{ message: "Coupoun is expired" },
				{ status: 404 }
			);
		}
		if (new Date(coupoun.useBy) < new Date()) {
			const coupun = await prismadb.coupouns.update({
				where: {
					code: coupounCode,
				},
				data: {
					archived: true,
				},
			});
			return NextResponse.json(
				{ message: "Coupoun is expired" },
				{ status: 404 }
			);
		}
		const discount = coupoun?.fixed
			? parseFloat(String(coupoun.amount))
			: (parseFloat(String(cart.subtotal)) *
					(parseFloat(String(coupoun?.percentage)) || 0)) /
			  100;

		const newCart = await prismadb.cart.update({
			where: {
				id: params.cartId,
			},
			data: {
				coupoun: {
					connect: {
						code: coupounCode,
					},
				},
				discount: discount,
				total:
					(parseFloat(String(cart.subtotal)) - discount) *
					(1 + parseFloat(String(coupoun.store.tax)) / 100),
			},
			include: {
				coupoun: true,
				products: {
					include: {
						category: true,
						color: true,
						size: true,
						images: true,
						filterItems: {
							include: {
								filterItem: {
									include: {
										filter: true,
									},
								},
							},
						},
					},
				},
			},
		});
		return NextResponse.json({
			message: "Coupoun Applied Successfully",
			data: newCart,
		});
	} catch (error) {
		console.log("[error Cart POST]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
