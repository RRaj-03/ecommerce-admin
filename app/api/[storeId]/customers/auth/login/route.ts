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
 * Customer login — called by the store frontend proxy.
 * Validates credentials and returns customer data (NO session — store handles that).
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400, headers: corsHeader }
      );
    }

    const customer = await prismadb.customer.findUnique({
      where: { storeId_email: { storeId: params.storeId, email: email.toLowerCase() } },
    });

    if (!customer) {
      return NextResponse.json(
        { error: "No account found for this email on this store. Please register." },
        { status: 401, headers: corsHeader }
      );
    }

    // Google-only accounts have empty passwordHash
    if (!customer.passwordHash) {
      return NextResponse.json(
        { error: "This account uses Google sign-in. Please use 'Continue with Google'." },
        { status: 400, headers: corsHeader }
      );
    }

    const valid = await bcrypt.compare(password, customer.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401, headers: corsHeader }
      );
    }

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
    console.error("[CUSTOMER_AUTH_LOGIN]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeader }
    );
  }
}
