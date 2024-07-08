import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
const corsHeader = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeader });
}

export async function DELETE(
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
		if (!params.orderId) {
			return new NextResponse("OrderId is required", {
				status: 400,
				headers: corsHeader,
			});
		}

		let order = await prismadb.order.findFirst({
			where: {
				id: params.orderId,
				user: {
					email: User.email!,
				},
			},
		});
		if (!order)
			return new NextResponse("Order not found", {
				status: 404,
				headers: corsHeader,
			});
		if (order.status !== "Paid") {
			return new NextResponse("Order cannot be cancelled", {
				status: 400,
				headers: corsHeader,
			});
		}
		order = await prismadb.order.update({
			where: {
				id: params.orderId,

				user: {
					email: User.email!,
				},
			},
			data: {
				orderStatus: {
					create: {
						status: "Cancelled",
						userId: order.userId,
					},
				},
				status: "Cancelled",
			},
		});

		return NextResponse.json(
			{
				message: "Order Cancelled",
			},
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
