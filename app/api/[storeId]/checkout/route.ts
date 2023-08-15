import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";
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
  request: Request,
  { params }: { params: { storeId: string } }
) {
  const { productIds, user } = await request.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }
  if (!user && !user.userId) {
    return new NextResponse("User is required", { status: 400 });
  }
  const products = await prismadb.product.findMany({
    where: {
      id: {
        in: productIds,
      },
    },
    include: {
      images: true,
      size: true,
      color: true,
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
  });
  const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];
  products.forEach((product) => {
    line_items.push({
      quantity: 1,
      price_data: {
        currency: "INR",
        product_data: {
          name: product.name,
          images: product.images.map((image) => image.url),
          description: `Size: ${product.size.name}
           | Color: ${product.color.name} | 
           ${product.filterItems
             .map(
               (item) =>
                 `${item.filterItem.filter.name}: ${item.filterItem.name} `
             )
             .join(" | ")}`,
        },
        unit_amount: product.price.toNumber() * 100,
      },
    });
  });
  const order = await prismadb.order.create({
    data: {
      userId: user.userId,
      phoneNumber: user.phoneNumber,
      emailAddress: user.emailAddress,
      firstName: user.firstName,
      lastName: user.lastName,
      storeId: params.storeId,
      isPaid: false,
      transactionId: "",
      orderItems: {
        create: productIds.map((productId: string) => ({
          product: {
            connect: {
              id: productId,
            },
          },
        })),
      },
    },
  });
  const session = await stripe.checkout.sessions.create({
    invoice_creation: {
      enabled: true,
      invoice_data: {
        rendering_options: { amount_tax_display: "include_inclusive_tax" },
        footer: "Order Id: " + order.id,
      },
    },
    line_items: line_items,
    mode: "payment",
    shipping_address_collection: {
      allowed_countries: ["IN"],
    },
    phone_number_collection: {
      enabled: true,
    },
    success_url: `${process.env.FORNTEND_STORE_URL}/cart?success=1`,
    cancel_url: `${process.env.FORNTEND_STORE_URL}/cart?canceled=1`,
    metadata: {
      orderId: order.id,
    },
  });

  return NextResponse.json({ url: session.url }, { headers: corsHeader });
}
