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
 * Google OAuth customer lookup/creation — called by the store frontend after
 * it exchanges the Google auth code for user info.
 * Find-or-create a customer by googleId or email, scoped to this store.
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { googleId, email, firstName, lastName, avatar } = await req.json();

    if (!googleId || !email) {
      return NextResponse.json(
        { error: "googleId and email required" },
        { status: 400, headers: corsHeader }
      );
    }

    // Find existing customer on this store by googleId or email
    let customer = await prismadb.customer.findFirst({
      where: {
        storeId: params.storeId,
        OR: [
          { googleId },
          { email: email.toLowerCase() },
        ],
      },
    });

    if (customer) {
      // Link Google account if first time signing in with Google on an existing email account
      if (!customer.googleId) {
        customer = await prismadb.customer.update({
          where: { id: customer.id },
          data: { googleId, avatar },
        });
      }
    } else {
      // New customer on this store
      customer = await prismadb.customer.create({
        data: {
          storeId: params.storeId,
          email: email.toLowerCase(),
          firstName: firstName || "",
          lastName: lastName || "",
          googleId,
          avatar,
          passwordHash: "", // Google-only account
        },
      });
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
    console.error("[CUSTOMER_AUTH_GOOGLE]", error);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500, headers: corsHeader }
    );
  }
}
