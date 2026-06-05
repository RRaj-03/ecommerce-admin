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
 * Update customer password — called by the store frontend proxy.
 * Validates current password, hashes new one, updates DB.
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId, currentPassword, newPassword } = await req.json();

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401, headers: corsHeader }
      );
    }
    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { error: "All fields required" },
        { status: 400, headers: corsHeader }
      );
    }
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
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

    if (!customer.passwordHash) {
      return NextResponse.json(
        { error: "This account uses Google sign-in and has no password." },
        { status: 400, headers: corsHeader }
      );
    }

    const valid = await bcrypt.compare(currentPassword, customer.passwordHash);
    if (!valid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 401, headers: corsHeader }
      );
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prismadb.customer.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return NextResponse.json({ success: true }, { headers: corsHeader });
  } catch (error) {
    console.error("[CUSTOMER_AUTH_UPDATE_PASSWORD]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeader }
    );
  }
}
