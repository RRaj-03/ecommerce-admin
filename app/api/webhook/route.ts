import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = (await headers().get("Stripe-Signature")) as string;

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook error : ${error.message}`, {
      status: 400,
    });
  }
  if (event.type === "charge.refunded") {
    const session = event.data.object as Stripe.Charge;
    await prismadb.order.update({
      where: { id: session.metadata?.orderId },
      data: {
        orderStatus: "REFUNDED",
        refundReciptUrl: session.receipt_url,
      },
    });
    return new NextResponse(null, { status: 200 });
  }
  if (event.type === "invoice.payment_succeeded") {
    const session = event.data.object as Stripe.Invoice;
    await prismadb.order.update({
      where: { id: session?.footer?.split(" ").pop() },
      data: {
        invoiceId: session.id,
        invoicePdfUrl: session.invoice_pdf ? session.invoice_pdf : "",
        invoiceUrl: session.hosted_invoice_url
          ? session.hosted_invoice_url
          : "",
      },
    });
    return new NextResponse(null, { status: 200 });
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const address = session?.shipping_details?.address;
    const addressComponents = [
      address?.line1,
      address?.line2,
      address?.city,
      address?.state,
      address?.postal_code,
      address?.country,
    ];
    const addressString = addressComponents
      .filter((c) => c !== null)
      .join(", ");
    console.log("session", session);
    const order = await prismadb.order.update({
      where: { id: session?.metadata?.orderId },
      data: {
        transactionId: `${session.payment_intent}`,
        isPaid: true,
        address: addressString,
        phone: session.customer_details?.phone || "",
      },
      include: { orderItems: true },
    });
    const productIds = order.orderItems.map((orderItem) => orderItem.productId);
    await prismadb.product.updateMany({
      where: {
        id: {
          in: productIds,
        },
      },
      data: {
        isArchived: true,
      },
    });
    return new NextResponse(null, { status: 200 });
  }
}
