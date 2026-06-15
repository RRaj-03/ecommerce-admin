import prismadb from "@/lib/prismadb";
import { getPhonePeClient } from "@/lib/phonepe";
import { NextResponse } from "next/server";

/**
 * POST /api/[storeId]/phonepe-callback
 *
 * Server-to-server callback from PhonePe. This is the reliable notification
 * that a payment has reached a terminal state (success or failure).
 *
 * PhonePe sends this asynchronously after the user completes (or abandons)
 * payment. Must return 200 quickly to prevent retries.
 */
export async function POST(
  request: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await request.text();
    const authorizationHeader = request.headers.get("Authorization") || "";

    // Fetch payment config for this store
    const paymentConfig = await prismadb.paymentConfig.findUnique({
      where: { storeId: params.storeId },
    });

    if (
      !paymentConfig ||
      !paymentConfig.phonepeMerchantId ||
      !paymentConfig.phonepeSaltKey
    ) {
      console.log("[PHONEPE_CALLBACK] No payment config for store:", params.storeId);
      return new NextResponse("Not configured", { status: 500 });
    }

    const client = getPhonePeClient(
      paymentConfig.phonepeMerchantId,
      paymentConfig.phonepeSaltKey,
      paymentConfig.phonepeSaltIndex
    );

    // Validate the callback authenticity
    // The SDK's validateCallback expects username, password, authorization header, and body
    let callbackResponse;
    try {
      // PhonePe S2S callbacks use basic auth — username and password are
      // configured in the PhonePe merchant dashboard. For the SDK's
      // validateCallback we pass the configured credentials.
      const username = process.env.PHONEPE_CALLBACK_USERNAME || "";
      const password = process.env.PHONEPE_CALLBACK_PASSWORD || "";

      callbackResponse = client.validateCallback(
        username,
        password,
        authorizationHeader,
        body
      );
    } catch (validationError: any) {
      console.log("[PHONEPE_CALLBACK] Validation failed:", validationError.message);
      // Even if validation fails, return 200 to prevent infinite retries
      // but don't process the payment
      return new NextResponse(null, { status: 200 });
    }

    const merchantOrderId = callbackResponse.payload?.merchantOrderId;
    const state = callbackResponse.payload?.state;

    if (!merchantOrderId) {
      console.log("[PHONEPE_CALLBACK] No merchantOrderId in callback");
      return new NextResponse(null, { status: 200 });
    }

    // Find the order
    const order = await prismadb.order.findFirst({
      where: { id: merchantOrderId, storeId: params.storeId },
    });

    if (!order) {
      console.log("[PHONEPE_CALLBACK] Order not found:", merchantOrderId);
      return new NextResponse(null, { status: 200 });
    }

    // Only process if order isn't already paid (idempotency)
    if (!order.isPaid && state === "COMPLETED") {
      await prismadb.order.update({
        where: { id: merchantOrderId },
        data: {
          isPaid: true,
          orderStatus: "Processing",
          paymentMethod: "phonepe",
          transactionId:
            callbackResponse.payload?.paymentDetails?.[0]?.transactionId || "",
        },
      });

      await prismadb.orderStatusHistory.create({
        data: {
          orderId: merchantOrderId,
          status: "Processing",
          note: "Payment confirmed via PhonePe (S2S callback)",
        },
      });
    } else if (state === "FAILED") {
      // If payment failed, restore inventory
      if (!order.isPaid) {
        const orderItems = await prismadb.orderItem.findMany({
          where: { orderId: merchantOrderId },
        });

        for (const item of orderItems) {
          await prismadb.product.update({
            where: { id: item.productId },
            data: { inventory: { increment: item.quantity } },
          });
        }

        await prismadb.order.update({
          where: { id: merchantOrderId },
          data: { orderStatus: "Failed" },
        });

        await prismadb.orderStatusHistory.create({
          data: {
            orderId: merchantOrderId,
            status: "Failed",
            note: "PhonePe payment failed",
          },
        });
      }
    }

    // Always return 200 to acknowledge receipt
    return new NextResponse(null, { status: 200 });
  } catch (error: any) {
    console.log("[PHONEPE_CALLBACK_ERROR]", error);
    // Return 200 even on error to prevent PhonePe from retrying indefinitely
    return new NextResponse(null, { status: 200 });
  }
}
