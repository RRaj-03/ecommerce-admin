import prismadb from "@/lib/prismadb";
import bcrypt from "bcryptjs";
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
 * Customer registration — called by the store frontend proxy.
 * Creates a new customer scoped to this store and returns customer data.
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { email, firstName, lastName, phone, password } = await req.json();

    if (!email || !firstName || !lastName || !password) {
      return NextResponse.json(
        { error: "Required fields missing" },
        { status: 400, headers: corsHeader }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400, headers: corsHeader }
      );
    }

    // Check if email already registered on THIS store
    const existing = await prismadb.customer.findUnique({
      where: { storeId_email: { storeId: params.storeId, email: email.toLowerCase() } },
    });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered on this store" },
        { status: 409, headers: corsHeader }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const customer = await prismadb.customer.create({
      data: {
        storeId: params.storeId,
        email: email.toLowerCase(),
        firstName,
        lastName,
        phone: phone || "",
        passwordHash,
      },
    });

    return NextResponse.json(
      {
        id: customer.id,
        firstName: customer.firstName,
        lastName: customer.lastName,
        email: customer.email,
        phone: customer.phone,
        avatar: customer.avatar,
        storeId: customer.storeId,
      },
      { headers: corsHeader }
    );
  } catch (error) {
    console.error("[CUSTOMER_AUTH_REGISTER]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeader }
    );
  }
}
