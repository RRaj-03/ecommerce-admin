import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
export async function POST(req: NextRequest) {
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
		const products = body?.products;
		const storeId = body?.storeId;
		if (products && storeId) {
			const user = await prismadb.user.findUnique({
				where: { email: User.email! },
			});
			if (!user) {
				return NextResponse.json(
					{ message: "User not found" },
					{ status: 404 }
				);
			}
			const newproducts = await Promise.all(
				products.map(async (product: any) => {
					return {
						id: product.id,
						name: product.name,
						price: product.price,
						description: product.description,
						image: product.image,
						storeId: storeId,
					};
				})
			);
			const store = await prismadb.store.findUnique({
				where: {
					id: storeId,
				},
			});
			if (!store) {
				return NextResponse.json(
					{ message: "Store not found" },
					{ status: 404 }
				);
			}
			const subtotal = newproducts.reduce((acc, curr) => acc + curr.price, 0);
			const tax = store?.tax || 0;
			const total = (1 + parseFloat(String(tax)) / 100) * subtotal;
			const cart = await prismadb.cart.upsert({
				where: {
					userId_storeId: {
						userId: user.id,
						storeId: storeId,
					},
				},
				create: {
					userId: user.id,
					storeId: storeId,
					products: {
						connect: [...newproducts],
					},
					discount: 0,
					subtotal: subtotal,
					total: total,
				},
				update: {
					products: {
						set: newproducts,
					},
					subtotal: subtotal,
					total: total,
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
			if (cart.coupoun) {
				const UseBy = new Date(cart.coupoun?.useBy);
				const today = new Date();
				if (
					UseBy < today ||
					parseFloat(String(cart.subtotal)) <= 0 ||
					cart.coupoun.archived
				) {
					await prismadb.cart.update({
						where: {
							id: cart.id,
						},
						data: {
							coupoun: {
								disconnect: true,
							},
						},
					});
					return NextResponse.json(
						{
							message:
								"Cart Updated Successfully, Coupoun is expired or invalid",
						},
						{ status: 200 }
					);
				} else {
					const discount = cart.coupoun?.fixed
						? parseFloat(String(cart.coupoun.amount))
						: (subtotal * (parseFloat(String(cart.coupoun?.percentage)) || 0)) /
						  100;
					const updatedCart = await prismadb.cart.update({
						where: {
							id: cart.id,
						},
						data: {
							discount: discount,
							total:
								(subtotal - discount) * (1 + parseFloat(String(tax)) / 100),
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
					return NextResponse.json(
						{ message: "Cart Updated Successfully", data: updatedCart },
						{ status: 200 }
					);
				}
			}

			return NextResponse.json(
				{ message: "Cart Updated Successfully", cart },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ message: "Invalid Data Products and storeId is required" },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.log("[error Cart POST]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
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
			include: {
				cart: {
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
				},
			},
		});
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		return NextResponse.json({ data: user.cart || [] }, { status: 200 });
	} catch (error) {
		console.log("[error Cart GET]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
