import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { auth } from "@clerk/nextjs";
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
    if (!params.orderId) {
      return new NextResponse("OrderId is required", {
        status: 400,
        headers: corsHeader,
      });
    }

    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        orderStatus: "Cancelled/REFUND STARTED",
      },
    });
    const session = await stripe.refunds.create({
      payment_intent: order.transactionId,
      metadata: {
        orderId: order.id,
      },
    });
    return NextResponse.json({}, { headers: corsHeader });
  } catch (error) {
    console.log("[Order_PATCH]", error);
    return new NextResponse("Internal Server error", {
      status: 500,
      headers: corsHeader,
    });
  }
}
