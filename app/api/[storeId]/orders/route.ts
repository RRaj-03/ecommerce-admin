import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

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
      return new NextResponse("StoreId is Required", { status: 400 });
    }
    if (!userId) {
      return new NextResponse("UserId is Required", { status: 400 });
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
    return NextResponse.json(order);
  } catch (error) {
    console.log("[Orders GET Error]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
