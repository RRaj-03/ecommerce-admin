import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";

// Update member (role, manager, availability)
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "team", "update");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const body = await req.json();
    const updateData: any = {};

    if (body.roleId !== undefined) updateData.roleId = body.roleId;
    if (body.managerId !== undefined) updateData.managerId = body.managerId || null;
    if (body.isAvailable !== undefined) updateData.isAvailable = body.isAvailable;

    const member = await prismadb.storeMember.update({
      where: { id: params.memberId },
      data: updateData,
      include: {
        user: { select: { id: true, name: true, email: true } },
        role: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(member);
  } catch (error) {
    console.log("[MEMBER_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Remove member
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; memberId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "team", "delete");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const store = await prismadb.store.findUnique({
      where: { id: params.storeId },
      select: { userId: true },
    });

    const member = await prismadb.storeMember.findUnique({
      where: { id: params.memberId },
    });

    if (member && store && member.userId === store.userId) {
      return new NextResponse("Cannot remove the store owner", { status: 400 });
    }

    await prismadb.storeMember.delete({ where: { id: params.memberId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[MEMBER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
