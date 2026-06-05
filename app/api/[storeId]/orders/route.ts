import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeader });
}

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: {
      storeId: string;
    };
  }
) {
  try {
    const { userId } = await req.json();
    if (!params.storeId) {
      return new NextResponse("StoreId is Required", { status: 400, headers: corsHeader });
    }
    if (!userId) {
      return new NextResponse("UserId is Required", { status: 400, headers: corsHeader });
    }
    const order = await prismadb.order.findMany({
      where: {
        storeId: params.storeId,
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
    });
    return NextResponse.json(order, { headers: corsHeader });
  } catch (error) {
    console.log("[Orders GET Error]", error);
    return new NextResponse("Internal Error", { status: 500, headers: corsHeader });
  }
}
