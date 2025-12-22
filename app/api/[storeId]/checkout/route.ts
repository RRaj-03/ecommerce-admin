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

  // Calculate quantities per product
  const productQuantityMap = productIds.reduce((acc: Record<string, number>, id: string) => {
    acc[id] = (acc[id] || 0) + 1;
    return acc;
  }, {});

  const uniqueProductIds = Object.keys(productQuantityMap);

  try {
    const { order, line_items, session } = await prismadb.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: {
          id: {
            in: uniqueProductIds,
          },
        },
        include: {
          images: true,
          category: true, // Check if 'size' and 'color' are valid relations. The original code used them but schema shows FilterItem relations.
          // Re-checking schema: Product has filterItems relation. 
          // Original code accessed product.size.name? Schema shows filterItems.
          // I will stick to what the schema provides. Original code might have been bugged or I missed something.
          // Let's rely on filterItems.
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

      for (const product of products) {
        const quantity = productQuantityMap[product.id];
        
        // Optimistic concurrency check / Inventory validation
        if (product.inventory < quantity) {
           throw new Error(`Product ${product.name} is out of stock (Requested: ${quantity}, Available: ${product.inventory})`);
        }

        // Decrement inventory
        await tx.product.update({
          where: { id: product.id },
          data: {
             inventory: { decrement: quantity }
          }
        });

        // Build description from filter items
        const description = product.filterItems
             .map((item) => `${item.filterItem.filter.name}: ${item.filterItem.name}`)
             .join(" | ");

        line_items.push({
          quantity: quantity,
          price_data: {
            currency: "INR",
            product_data: {
              name: product.name,
              images: product.images.map((image) => image.url),
              description: description,
            },
            unit_amount: Number(product.price) * 100,
          },
        });
      }

      const order = await tx.order.create({
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
      
      return { order, line_items, session };
    });

    return NextResponse.json({ url: session.url }, { headers: corsHeader });

  } catch (error: any) {
    console.log("[Checkout Error]", error);
    return new NextResponse(`Checkout Failed: ${error.message}`, { status: 500 }); // Returning 500 but with message, implies OOS
  }
}
