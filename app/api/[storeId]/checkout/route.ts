import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const corsHeader = {
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Methods": "GET, POST, DELETE, PUT, OPTIONS",
	"Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
	return NextResponse.json({}, { headers: corsHeader });
}

export async function POST(
	request: NextRequest,
	{ params }: { params: { storeId: string } }
) {
	let orderId = null;
	try {
		const { cartId, addressId, token } = await request.json();
		if (!token) {
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
		const redirectUrl = request.nextUrl.searchParams.get("redirectUrl");

		if (!cartId) {
			return NextResponse.json(
				{ message: "CartId is required" },
				{ status: 400 }
			);
		}
		if (!addressId) {
			return NextResponse.json(
				{ message: "AddressId is required" },
				{ status: 400 }
			);
		}
		const cart = await prismadb.cart.findUnique({
			where: {
				id: cartId,
			},
			include: {
				products: true,
				coupoun: true,
				user: true,
			},
		});
		if (!cart) {
			return NextResponse.json({ message: "Cart not found" }, { status: 404 });
		}
		if (cart.user.email !== User.email) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const address = await prismadb.address.findUnique({
			where: {
				id: addressId,
			},
		});
		if (!address) {
			return NextResponse.json(
				{ message: "Address not found" },
				{ status: 404 }
			);
		}
		const order = await prismadb.order.create({
			data: {
				user: {
					connect: {
						email: User.email,
					},
				},
				address: {
					connect: {
						id: addressId,
					},
				},
				coupouns: {
					connect: cart.coupoun ? { id: cart.coupoun.id } : undefined,
				},

				Products: {
					connect: cart.products.map((product) => ({ id: product.id })),
				},
				total: cart.total,
				subtotal: cart.subtotal,
				discount: cart.discount,
				transactionId: "",
				store: {
					connect: {
						id: params.storeId,
					},
				},
			},
			include: {
				Products: {
					include: {
						images: true,
					},
				},
				store: true,
			},
		});
		orderId = order.id;
		const session = await stripe.checkout.sessions.create({
			invoice_creation: {
				enabled: true,
				invoice_data: {
					rendering_options: { amount_tax_display: "include_inclusive_tax" },
					footer: "Order Id: " + order.id,
				},
			},
			line_items: [
				{
					price_data: {
						currency: "inr",
						product_data: {
							name: order.store.name,
							images: [
								"https://img.freepik.com/free-vector/quill-pen-logo-template_23-2149852432.jpg?size=338&ext=jpg&ga=GA1.1.1546980028.1719619200&semt=ais_user",
							],
						},
						unit_amount: parseFloat(String(order.total)) * 100,
					},
					quantity: 1,
				},
			],
			mode: "payment",
			payment_method_types: ["card"],
			success_url: `${redirectUrl}?success=1`,
			cancel_url: `${redirectUrl}?canceled=1`,
			metadata: {
				orderId: order.id,
			},
			customer_email: User.email,
		});

		return NextResponse.json({ url: session.url }, { headers: corsHeader });
	} catch (error) {
		if (orderId) {
			await prismadb.order.delete({
				where: {
					id: orderId,
				},
			});
		}
		console.log("[Checkout POST Error]", error);
		return NextResponse.json(
			{ message: "Internal Error", error },
			{ status: 500 }
		);
	}
}
