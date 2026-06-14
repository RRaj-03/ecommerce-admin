import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

const corsHeader = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeader });
}

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      orderId: string;
      storeId: string;
    };
  }
) {
  try {
    if (!params.orderId) {
      return new NextResponse("OrderId is required", { status: 400 });
    }

    const order = await prismadb.order.findFirst({
      where: {
        id: params.orderId,
        storeId: params.storeId,
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
        statusHistory: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
    return NextResponse.json(order, { headers: corsHeader });
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
    const { userId } = await auth();
    const body = await req.json();
    const { status, trackingNumber, trackingUrl, carrier, estimatedDelivery, note } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
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

    // Build update data
    const updateData: any = {};
    if (status) updateData.orderStatus = status;
    if (trackingNumber !== undefined) updateData.trackingNumber = trackingNumber;
    if (trackingUrl !== undefined) updateData.trackingUrl = trackingUrl;
    if (carrier !== undefined) updateData.carrier = carrier;
    if (estimatedDelivery) updateData.estimatedDelivery = new Date(estimatedDelivery);

    // Update order
    const order = await prismadb.order.update({
      where: {
        id: params.orderId,
      },
      data: updateData,
    });

    // Create status history entry if status changed
    if (status) {
      await prismadb.orderStatusHistory.create({
        data: {
          orderId: params.orderId,
          status,
          note: note || `Status updated to ${status}`,
        },
      });
    }

    return NextResponse.json(order);
  } catch (error) {
    console.log("[Order_PATCH]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}
