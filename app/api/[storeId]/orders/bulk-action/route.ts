import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";

/**
 * POST /api/[storeId]/orders/bulk-action
 * Body: { orderIds: string[], action: "updateStatus", status: string, note?: string }
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "orders", "update");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const body = await req.json();
    const { orderIds, action, status, note } = body;

    if (!orderIds || !orderIds.length) {
      return new NextResponse("orderIds required", { status: 400 });
    }

    if (action === "updateStatus") {
      if (!status) return new NextResponse("status required", { status: 400 });

      const updated = await prismadb.order.updateMany({
        where: { id: { in: orderIds }, storeId: params.storeId },
        data: { orderStatus: status },
      });

      // Log status change for each order
      for (const oid of orderIds) {
        await prismadb.orderStatusHistory.create({
          data: {
            orderId: oid,
            status,
            note: note || `Bulk status update by ${userId}`,
          },
        });
      }

      return NextResponse.json({ updated: updated.count, action: "updateStatus", status });
    }

    return new NextResponse(`Unknown action: ${action}`, { status: 400 });
  } catch (error) {
    console.log("[ORDER_BULK_ACTION_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
