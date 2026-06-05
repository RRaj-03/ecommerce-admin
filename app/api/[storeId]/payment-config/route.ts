import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeader });
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const config = await prismadb.paymentConfig.findUnique({
      where: { storeId: params.storeId },
    });

    if (!config) {
      return NextResponse.json({
        stripeEnabled: true,
        phonepeEnabled: false,
        codEnabled: false,
        currency: "INR",
      }, { headers: corsHeader });
    }

    // Don't expose secret keys to the store frontend
    return NextResponse.json({
      stripeEnabled: config.stripeEnabled,
      phonepeEnabled: config.phonepeEnabled,
      codEnabled: config.codEnabled,
      codMinOrder: config.codMinOrder,
      codMaxOrder: config.codMaxOrder,
      currency: config.currency,
      taxRate: config.taxRate,
    }, { headers: corsHeader });
  } catch (error) {
    console.log("[PAYMENT_CONFIG_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    const body = await req.json();

    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const config = await prismadb.paymentConfig.upsert({
      where: { storeId: params.storeId },
      update: body,
      create: {
        storeId: params.storeId,
        ...body,
      },
    });

    return NextResponse.json(config);
  } catch (error) {
    console.log("[PAYMENT_CONFIG_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
