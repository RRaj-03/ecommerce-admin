import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
import { stripe } from "@/lib/stripe";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: {
			orderId: string;
		};
	}
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
			include: { address: true },
		});
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		if (!params.orderId) {
			return new NextResponse("OrderId is required", { status: 400 });
		}

		const order = await prismadb.order.findUnique({
			where: {
				id: params.orderId,
			},
			include: {
				Products: {
					include: {
						images: true,
					},
				},
				address: true,
				coupouns: true,
				user: true,
				store: true,
			},
		});
		return NextResponse.json(order);
	} catch (error) {
		console.log("[Order_get]", error);
		return new NextResponse("Internal Server error", { status: 500 });
	}
}

export async function PATCH(
	req: Request,
	{
		params,
	}: {
		params: {
			storeId: string;
			orderId: string;
		};
	}
) {
	try {
		const { userId } = await auth();
		const body = await req.json();
		const { status } = body;
		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}
		if (!status) {
			return new NextResponse("status is Required", { status: 400 });
		}

		if (!params.orderId) {
			return new NextResponse("OrderId is required", { status: 400 });
		}
		const storeByUserId = await prismadb.store.findFirst({
			where: {
				id: params.storeId,
				userId,
			},
		});
		if (!storeByUserId) {
			return new NextResponse("Unauthorized", { status: 403 });
		}
		const order = await prismadb.order.update({
			where: {
				id: params.orderId,
			},
			data: {
				status,
				orderStatus: {
					create: {
						status,
						userId,
					},
				},
			},
		});

		return NextResponse.json(order);
	} catch (error) {
		console.log("[Order_PATCH]", error);
		return new NextResponse("Internal Server error", { status: 500 });
	}
}
export async function PUT(
	req: Request,
	{
		params,
	}: {
		params: {
			orderId: string;
		};
	}
) {
	try {
		const { userId } = await auth();
		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}
		if (!params.orderId) {
			return new NextResponse("OrderId is required", {
				status: 400,
			});
		}

		let order = await prismadb.order.findFirst({
			where: {
				id: params.orderId,
				user: {
					id: userId,
				},
			},
		});
		if (!order)
			return new NextResponse("Order not found", {
				status: 404,
			});
		if (order.status !== "Cancelled") {
			return new NextResponse("Cancel Before Initiating Refund", {
				status: 400,
			});
		}

		const session = await stripe.refunds.create({
			payment_intent: order.transactionId,
			metadata: {
				orderId: order.id,
			},
		});
		order = await prismadb.order.update({
			where: {
				id: params.orderId,

				user: {
					id: userId,
				},
			},
			data: {
				orderStatus: {
					create: {
						status: "RefundInitiated",
						userId,
					},
				},
				status: "RefundInitiated",
			},
		});
		return NextResponse.json({
			message: "Order Refund Initiated",
		});
	} catch (error) {
		console.log("[Order_]", error);
		return new NextResponse("Internal Server error", {
			status: 500,
		});
	}
}
