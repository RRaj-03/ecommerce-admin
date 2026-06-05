import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
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
    const theme = await prismadb.storeTheme.findUnique({
      where: { storeId: params.storeId },
    });

    // Return defaults if no theme configured yet
    if (!theme) {
      return NextResponse.json({
        preset: "default",
        primaryColor: "222.2 47.4% 11.2%",
        secondaryColor: "210 40% 96.1%",
        accentColor: "210 40% 96.1%",
        backgroundColor: "0 0% 100%",
        foregroundColor: "222.2 84% 4.9%",
        mutedColor: "210 40% 96.1%",
        mutedForeground: "215.4 16.3% 46.9%",
        borderColor: "214.3 31.8% 91.4%",
        cardColor: "0 0% 100%",
        destructiveColor: "0 84.2% 60.2%",
        darkPrimary: "210 40% 98%",
        darkSecondary: "217.2 32.6% 17.5%",
        darkAccent: "217.2 32.6% 17.5%",
        darkBackground: "222.2 84% 4.9%",
        darkForeground: "210 40% 98%",
        darkMuted: "217.2 32.6% 17.5%",
        darkMutedFg: "215 20.2% 65.1%",
        darkBorder: "217.2 32.6% 17.5%",
        darkCard: "222.2 84% 4.9%",
        darkDestructive: "0 62.8% 30.6%",
        fontFamily: "Inter",
        headingFont: "Inter",
        borderRadius: "0.5rem",
        navbarStyle: "default",
        footerStyle: "default",
        productCardStyle: "default",
      }, { headers: corsHeader });
    }

    return NextResponse.json(theme, { headers: corsHeader });
  } catch (error) {
    console.log("[THEME_GET]", error);
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

    // Verify store ownership
    const store = await prismadb.store.findFirst({
      where: { id: params.storeId, userId },
    });

    if (!store) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const theme = await prismadb.storeTheme.upsert({
      where: { storeId: params.storeId },
      update: body,
      create: {
        storeId: params.storeId,
        ...body,
      },
    });

    return NextResponse.json(theme);
  } catch (error) {
    console.log("[THEME_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
