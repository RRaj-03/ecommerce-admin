import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeader });
}

/**
 * Update customer profile — called by the store frontend proxy.
 * The store sends the userId from its session; we validate it belongs to this store.
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId, firstName, lastName, email, phone } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeader }
      );
    }
    if (!firstName || !lastName || !email) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400, headers: corsHeader }
      );
    }

    // Validate customer belongs to this store
    const customer = await prismadb.customer.findUnique({
      where: { id: userId },
    });
    if (!customer || customer.storeId !== params.storeId) {
      return NextResponse.json(
        { error: "Invalid user for this store" },
        { status: 401, headers: corsHeader }
      );
    }

    // Check if email is taken by another customer on this store
    const existing = await prismadb.customer.findUnique({
      where: { storeId_email: { storeId: params.storeId, email: email.toLowerCase() } },
    });
    if (existing && existing.id !== userId) {
      return NextResponse.json(
        { error: "Email already in use on this store" },
        { status: 409, headers: corsHeader }
      );
    }

    const updated = await prismadb.customer.update({
      where: { id: userId },
      data: { firstName, lastName, email: email.toLowerCase(), phone: phone || "" },
    });

    return NextResponse.json(
      {
        id: updated.id,
        firstName: updated.firstName,
        lastName: updated.lastName,
        email: updated.email,
        phone: updated.phone,
        avatar: updated.avatar,
        storeId: updated.storeId,
      },
      { headers: corsHeader }
    );
  } catch (error) {
    console.error("[CUSTOMER_AUTH_UPDATE_PROFILE]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeader }
    );
  }
}
