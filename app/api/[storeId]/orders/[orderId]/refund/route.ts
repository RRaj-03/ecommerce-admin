import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";
const corsHeader = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeader });
}

export async function POST(
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
		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}
		if (!params.orderId) {
			return new NextResponse("OrderId is required", {
				status: 400,
				headers: corsHeader,
			});
		}

		const order = await prismadb.order.findFirst({
			where: {
				id: params.orderId,
			},
		});
		if (!order) {
			return new NextResponse("Order not found", {
				status: 404,
				headers: corsHeader,
			});
		}
		if (order.status !== "Cancelled") {
			return new NextResponse("Order is not cancelled", {
				status: 400,
				headers: corsHeader,
			});
		}

		const session = await stripe.refunds.create({
			payment_intent: order.transactionId,
			metadata: {
				orderId: order.id,
			},
		});
		const orderRefund = await prismadb.order.update({
			where: {
				id: params.orderId,
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
		return NextResponse.json(
			{ message: "Refund Initiated Successfully" },
			{ headers: corsHeader }
		);
	} catch (error) {
		console.log("[Order_PATCH]", error);
		return new NextResponse("Internal Server error", {
			status: 500,
			headers: corsHeader,
		});
	}
}
