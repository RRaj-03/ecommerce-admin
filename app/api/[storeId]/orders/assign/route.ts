import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requirePermission, getSubordinateIds, getPermissionScope } from "@/lib/rbac";
import { sendOrderAssignmentEmail } from "@/lib/email";

/**
 * POST /api/[storeId]/orders/assign
 * Body: { orderId: string, assignToMemberId: string, note?: string }
 *   OR  { orderIds: string[], assignToMemberId: string, note?: string } for bulk
 */
export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "orders", "assign");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const body = await req.json();
    const { orderId, orderIds, assignToMemberId, note } = body;

    const idsToAssign: string[] = orderIds || (orderId ? [orderId] : []);
    if (idsToAssign.length === 0) {
      return new NextResponse("orderId or orderIds required", { status: 400 });
    }
    if (!assignToMemberId) {
      return new NextResponse("assignToMemberId required", { status: 400 });
    }

    // Verify target member belongs to this store
    const targetMember = await prismadb.storeMember.findFirst({
      where: { id: assignToMemberId, storeId: params.storeId },
      include: { user: { select: { email: true, name: true } } },
    });
    if (!targetMember) {
      return new NextResponse("Target member not found in this store", { status: 404 });
    }

    // Check scope: can this user assign to anyone, or only subordinates?
    const scope = await getPermissionScope(userId, params.storeId, "orders", "assign");
    if (scope === "subordinates") {
      // Find the assigner's member record
      const assignerMember = await prismadb.storeMember.findUnique({
        where: { storeId_userId: { storeId: params.storeId, userId } },
      });
      if (assignerMember) {
        const subordinateIds = await getSubordinateIds(assignerMember.id);
        if (!subordinateIds.includes(assignToMemberId)) {
          return new NextResponse(
            "You can only assign orders to your subordinates",
            { status: 403 }
          );
        }
      }
    }

    // Perform assignments
    const results = [];
    for (const oid of idsToAssign) {
      const order = await prismadb.order.findFirst({
        where: { id: oid, storeId: params.storeId },
        select: { id: true, assignedToId: true },
      });
      if (!order) continue;

      await prismadb.order.update({
        where: { id: oid },
        data: { assignedToId: assignToMemberId },
      });

      // Audit log
      await prismadb.orderAssignmentHistory.create({
        data: {
          orderId: oid,
          assignedById: userId,
          assignedToId: assignToMemberId,
          previousToId: order.assignedToId || null,
          note: note || null,
        },
      });

      results.push(oid);
    }

    // Send email notification
    const store = await prismadb.store.findUnique({ where: { id: params.storeId }, select: { name: true } });
    sendOrderAssignmentEmail(
      targetMember.user.email,
      targetMember.user.name,
      results.length,
      store?.name || "Your Store"
    );

    return NextResponse.json({
      assigned: results.length,
      orderIds: results,
      assignedTo: {
        id: targetMember.id,
        name: targetMember.user.name,
        email: targetMember.user.email,
      },
    });
  } catch (error) {
    console.log("[ORDER_ASSIGN_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
