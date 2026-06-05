import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
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
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!params.storeId) {
      return new NextResponse("StoreId is Required", { status: 400, headers: corsHeader });
    }
    if (!userId) {
      return new NextResponse("UserId is Required", { status: 400, headers: corsHeader });
    }

    const addresses = await prismadb.customerAddress.findMany({
      where: {
        customerId: userId,
        customer: {
          storeId: params.storeId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(addresses, { headers: corsHeader });
  } catch (error) {
    console.log("[ADDRESSES_GET_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500, headers: corsHeader });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { userId, name, street, city, state, pincode, country, isDefault } = body;

    if (!params.storeId) {
      return new NextResponse("StoreId is Required", { status: 400, headers: corsHeader });
    }
    if (!userId || !name || !street || !city || !state || !pincode) {
      return new NextResponse("Missing required fields", { status: 400, headers: corsHeader });
    }

    // Verify user belongs to store
    const customer = await prismadb.customer.findUnique({
      where: { id: userId },
    });

    if (!customer || customer.storeId !== params.storeId) {
      return new NextResponse("Invalid user", { status: 401, headers: corsHeader });
    }

    if (isDefault) {
      // Unset previous defaults
      await prismadb.customerAddress.updateMany({
        where: { customerId: userId },
        data: { isDefault: false },
      });
    }

    const address = await prismadb.customerAddress.create({
      data: {
        customerId: userId,
        name,
        street,
        city,
        state,
        pincode,
        country: country || "India",
        isDefault: isDefault || false,
      },
    });

    return NextResponse.json(address, { headers: corsHeader });
  } catch (error) {
    console.log("[ADDRESSES_POST_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500, headers: corsHeader });
  }
}
