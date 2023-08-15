import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      orderId: string;
    };
  }
) {
  try {
    if (!params.orderId) {
      return new NextResponse("OrderId is required", { status: 400 });
    }

    const order = await prismadb.order.findUnique({
      where: {
        id: params.orderId,
      },
      include: {
        orderItems: {
          include: {
            product: {
              include: {
                images: true,
              },
            },
          },
        },
      },
    });
    return NextResponse.json(order);
  } catch (error) {
    console.log("[Order_get]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      storeId: string;
      orderId: string;
    };
  }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const { status } = body;
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!status) {
      return new NextResponse("status is Required", { status: 400 });
    }

    if (!params.orderId) {
      return new NextResponse("OrderId is required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: {
        orderStatus: status,
      },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[Order_PATCH]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}
