import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeader });
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; addressId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!params.storeId) {
      return new NextResponse("StoreId is Required", { status: 400, headers: corsHeader });
    }
    if (!params.addressId) {
      return new NextResponse("AddressId is Required", { status: 400, headers: corsHeader });
    }
    if (!userId) {
      return new NextResponse("UserId is Required", { status: 400, headers: corsHeader });
    }

    const address = await prismadb.customerAddress.findUnique({
      where: { id: params.addressId },
    });

    if (!address || address.customerId !== userId) {
      return new NextResponse("Not authorized", { status: 403, headers: corsHeader });
    }

    await prismadb.customerAddress.delete({
      where: { id: params.addressId },
    });

    return NextResponse.json({ success: true }, { headers: corsHeader });
  } catch (error) {
    console.log("[ADDRESS_DELETE_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500, headers: corsHeader });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; addressId: string } }
) {
  try {
    const body = await req.json();
    const { userId, name, street, city, state, pincode, country, isDefault } = body;

    if (!params.storeId) {
      return new NextResponse("StoreId is Required", { status: 400, headers: corsHeader });
    }
    if (!params.addressId) {
      return new NextResponse("AddressId is Required", { status: 400, headers: corsHeader });
    }
    if (!userId) {
      return new NextResponse("UserId is Required", { status: 400, headers: corsHeader });
    }

    const existingAddress = await prismadb.customerAddress.findUnique({
      where: { id: params.addressId },
    });

    if (!existingAddress || existingAddress.customerId !== userId) {
      return new NextResponse("Not authorized", { status: 403, headers: corsHeader });
    }

    if (isDefault) {
      // Unset previous defaults
      await prismadb.customerAddress.updateMany({
        where: { customerId: userId },
        data: { isDefault: false },
      });
    }

    const address = await prismadb.customerAddress.update({
      where: { id: params.addressId },
      data: {
        name,
        street,
        city,
        state,
        pincode,
        country,
        isDefault,
      },
    });

    return NextResponse.json(address, { headers: corsHeader });
  } catch (error) {
    console.log("[ADDRESS_PATCH_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500, headers: corsHeader });
  }
}
