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
  const { productIds, user, paymentMethod = "stripe", address } = await request.json();

  if (!productIds || productIds.length === 0) {
    return new NextResponse("Product ids are required", { status: 400 });
  }
  if (!user || !user.userId) {
    return new NextResponse("User is required", { status: 400 });
  }

  // Calculate quantities per product
  const productQuantityMap = productIds.reduce(
    (acc: Record<string, number>, id: string) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    },
    {}
  );
  const uniqueProductIds = Object.keys(productQuantityMap);

  // Validate that the user actually exists on THIS store
  const customer = await prismadb.customer.findUnique({
    where: {
      id: user.userId,
    },
  });

  if (!customer || customer.storeId !== params.storeId) {
    return new NextResponse("Invalid user for this store", { status: 401 });
  }

  try {
    // Fetch payment config
    const paymentConfig = await prismadb.paymentConfig.findUnique({
      where: { storeId: params.storeId },
    });

    // Validate requested payment method is enabled
    const methodEnabled =
      paymentMethod === "stripe"
        ? paymentConfig?.stripeEnabled ?? true
        : paymentMethod === "phonepe"
        ? paymentConfig?.phonepeEnabled ?? false
        : paymentMethod === "cod"
        ? paymentConfig?.codEnabled ?? false
        : false;

    if (!methodEnabled) {
      return new NextResponse(
        `Payment method "${paymentMethod}" is not enabled for this store`,
        { status: 400 }
      );
    }

    const result = await prismadb.$transaction(async (tx) => {
      const products = await tx.product.findMany({
        where: { id: { in: uniqueProductIds } },
        include: {
          images: true,
          filterItems: {
            include: { filterItem: { include: { filter: true } } },
          },
        },
      });

      // Inventory validation + decrement
      for (const product of products) {
        const quantity = productQuantityMap[product.id];
        if (product.inventory < quantity) {
          throw new Error(
            `"${product.name}" is out of stock (requested: ${quantity}, available: ${product.inventory})`
          );
        }
        await tx.product.update({
          where: { id: product.id },
          data: { inventory: { decrement: quantity } },
        });
      }

      // Calculate order total
      const subtotal = products.reduce((sum, product) => {
        return sum + Number(product.price) * productQuantityMap[product.id];
      }, 0);

      const taxRate = paymentConfig?.taxRate ? Number(paymentConfig.taxRate) : 0;
      const totalAmount = subtotal + (subtotal * taxRate) / 100;

      // COD-specific validations
      if (paymentMethod === "cod") {
        const codMin = paymentConfig?.codMinOrder ? Number(paymentConfig.codMinOrder) : 0;
        const codMax = paymentConfig?.codMaxOrder ? Number(paymentConfig.codMaxOrder) : Infinity;
        if (totalAmount < codMin) throw new Error(`Minimum order for COD is ₹${codMin}`);
        if (totalAmount > codMax) throw new Error(`Maximum order for COD is ₹${codMax}`);
      }

      // Create the order
      const order = await tx.order.create({
        data: {
          userId: user.userId,
          phoneNumber: user.phoneNumber || "",
          emailAddress: user.emailAddress || "",
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          address: address || "",
          storeId: params.storeId,
          isPaid: paymentMethod === "cod" ? false : false,
          paymentMethod,
          transactionId: "",
          totalAmount: totalAmount,
          taxAmount: (subtotal * taxRate) / 100,
          orderItems: {
            create: uniqueProductIds.map((productId) => ({
              product: { connect: { id: productId } },
              quantity: productQuantityMap[productId],
              priceAtTime: products.find((p) => p.id === productId)?.price,
            })),
          },
        },
      });

      // Create initial status history entry
      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          status: "Ordered",
          note: `Order placed via ${paymentMethod}`,
        },
      });

      return { order, products, subtotal, totalAmount };
    });

    // ── Stripe ──────────────────────────────────────────────────────────────
    if (paymentMethod === "stripe") {
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] =
        result.products.map((product) => {
          const quantity = productQuantityMap[product.id];
          const description = product.filterItems
            .map((item) => `${item.filterItem.filter.name}: ${item.filterItem.name}`)
            .join(" | ");

          return {
            quantity,
            price_data: {
              currency: paymentConfig?.currency?.toLowerCase() ?? "inr",
              product_data: {
                name: product.name,
                images: product.images.map((i) => i.url),
                description: description || undefined,
              },
              unit_amount: Number(product.price) * 100,
            },
          };
        });

      const session = await stripe.checkout.sessions.create({
        invoice_creation: {
          enabled: true,
          invoice_data: {
            rendering_options: { amount_tax_display: "include_inclusive_tax" },
            footer: "Order Id: " + result.order.id,
          },
        },
        line_items,
        mode: "payment",
        shipping_address_collection: { allowed_countries: ["IN"] },
        phone_number_collection: { enabled: true },
        success_url: `${process.env.FORNTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FORNTEND_STORE_URL}/cart?canceled=1`,
        metadata: { orderId: result.order.id },
      });

      return NextResponse.json({ url: session.url }, { headers: corsHeader });
    }

    // ── Cash on Delivery ─────────────────────────────────────────────────────
    if (paymentMethod === "cod") {
      // Update order status to Processing (payment will happen on delivery)
      await prismadb.order.update({
        where: { id: result.order.id },
        data: { orderStatus: "Processing" },
      });
      await prismadb.orderStatusHistory.create({
        data: {
          orderId: result.order.id,
          status: "Processing",
          note: "COD order confirmed, awaiting shipment",
        },
      });

      return NextResponse.json(
        { orderId: result.order.id },
        { headers: corsHeader }
      );
    }

    // ── PhonePe ──────────────────────────────────────────────────────────────
    if (paymentMethod === "phonepe") {
      const { StandardCheckoutClient, Env, StandardCheckoutPayRequest } =
        await import("@phonepe-pg/pg-sdk-node");

      const clientId = paymentConfig!.phonepeMerchantId; // stores Client ID
      const clientSecret = paymentConfig!.phonepeSaltKey; // stores Client Secret
      const clientVersion = paymentConfig!.phonepeSaltIndex; // stores client version

      if (!clientId || !clientSecret) {
        return new NextResponse("PhonePe credentials not configured", {
          status: 500,
          headers: corsHeader,
        });
      }

      const env =
        process.env.PHONEPE_ENV === "PRODUCTION"
          ? Env.PRODUCTION
          : Env.SANDBOX;
      const client = StandardCheckoutClient.getInstance(
        clientId,
        clientSecret,
        clientVersion,
        env
      );

      const storeUrl =
        request.headers.get("origin") ||
        process.env.FORNTEND_STORE_URL ||
        process.env.FRONTEND_STORE_URL ||
        "http://localhost:3002";

      const phonePeRequest = StandardCheckoutPayRequest.builder()
        .merchantOrderId(result.order.id)
        .amount(Math.round(result.totalAmount * 100)) // amount in paisa
        .redirectUrl(
          `${storeUrl}/order/${result.order.id}?phonepe_status=1`
        )
        .build();

      const phonePeResponse = await client.pay(phonePeRequest);
      return NextResponse.json(
        { url: phonePeResponse.redirectUrl },
        { headers: corsHeader }
      );
    }

    return new NextResponse("Unknown payment method", { status: 400, headers: corsHeader });
  } catch (error: any) {
    console.log("[Checkout Error]", error);
    return new NextResponse(`Checkout failed: ${error.message}`, {
      status: 500,
      headers: corsHeader,
    });
  }
}
