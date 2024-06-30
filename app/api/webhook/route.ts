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
	// if (event.type === "payment_intent.succeeded") {
	// 	const session = event.data.object as Stripe.PaymentIntent;
	// 	console.log("session", session);
	// 	const order = await prismadb.order.update({
	// 		where: { id: session?.metadata?.orderId },
	// 		data: {
	// 			transactionId: session.id,
	// 			isPaid: true,
	// 			phone: "",
	// 			paidAmount: session.amount_received / 100,
	// 			paidAt: new Date(),
	// 		},
	// 		include: { Products: true },
	// 	});
	// 	const productIds = order.Products.map((orderItem) => orderItem.id);
	// 	await prismadb.product.updateMany({
	// 		where: {
	// 			id: {
	// 				in: productIds,
	// 			},
	// 		},
	// 		data: {
	// 			isArchived: true,
	// 		},
	// 	});
	// 	return new NextResponse(null, { status: 200 });
	// }
	if (event.type === "checkout.session.completed") {
		const session = event.data.object as Stripe.Checkout.Session;
		const order = await prismadb.order.update({
			where: { id: session?.metadata?.orderId },
			data: {
				transactionId: `${session.payment_intent}`,
				isPaid: true,
				paidAmount: session.amount_total! / 100,
				paidAt: new Date(),
				phone: session.customer_details?.phone || "",
			},
			include: { Products: true },
		});
		const productIds = order.Products.map((orderItem) => orderItem.id);
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
