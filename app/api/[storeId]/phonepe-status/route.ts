import prismadb from "@/lib/prismadb";
import { getPhonePeClient } from "@/lib/phonepe";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeader });
}

/**
 * GET /api/[storeId]/phonepe-status?orderId=xxx
 *
 * Called by the store frontend after PhonePe redirects the user back.
 * Verifies the payment status server-side using the PhonePe SDK, then
 * updates the order accordingly.
 */
export async function GET(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return new NextResponse("orderId is required", {
        status: 400,
        headers: corsHeader,
      });
    }

    // Fetch the order to make sure it belongs to this store
    const order = await prismadb.order.findFirst({
      where: { id: orderId, storeId: params.storeId },
    });

    if (!order) {
      return new NextResponse("Order not found", {
        status: 404,
        headers: corsHeader,
      });
    }

    // If already paid, skip the PhonePe check
    if (order.isPaid) {
      return NextResponse.json(
        { status: "COMPLETED", orderId: order.id },
        { headers: corsHeader }
      );
    }

    // Fetch payment config for PhonePe credentials
    const paymentConfig = await prismadb.paymentConfig.findUnique({
      where: { storeId: params.storeId },
    });

    if (
      !paymentConfig ||
      !paymentConfig.phonepeMerchantId ||
      !paymentConfig.phonepeSaltKey
    ) {
      return new NextResponse("PhonePe not configured", {
        status: 500,
        headers: corsHeader,
      });
    }

    const client = getPhonePeClient(
      paymentConfig.phonepeMerchantId,
      paymentConfig.phonepeSaltKey,
      paymentConfig.phonepeSaltIndex
    );

    // The merchantOrderId we used during pay() was the order.id
    const statusResponse = await client.getOrderStatus(orderId);
    const state = statusResponse.state;

    if (state === "COMPLETED") {
      // Update order as paid
      await prismadb.order.update({
        where: { id: orderId },
        data: {
          isPaid: true,
          orderStatus: "Processing",
          paymentMethod: "phonepe",
          transactionId: statusResponse.paymentDetails?.[0]?.transactionId || "",
        },
      });

      await prismadb.orderStatusHistory.create({
        data: {
          orderId,
          status: "Processing",
          note: "Payment confirmed via PhonePe",
        },
      });

      return NextResponse.json(
        { status: "COMPLETED", orderId },
        { headers: corsHeader }
      );
    }

    // PENDING, FAILED, etc.
    return NextResponse.json(
      { status: state || "PENDING", orderId },
      { headers: corsHeader }
    );
  } catch (error: any) {
    console.log("[PHONEPE_STATUS_ERROR]", error);
    return new NextResponse(`PhonePe status check failed: ${error.message}`, {
      status: 500,
      headers: corsHeader,
    });
  }
}
