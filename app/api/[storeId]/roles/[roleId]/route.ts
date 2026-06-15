import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; roleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "roles", "view");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const role = await prismadb.role.findUnique({
      where: { id: params.roleId },
      include: {
        permissions: true,
        members: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
      },
    });

    if (!role || role.storeId !== params.storeId) {
      return new NextResponse("Role not found", { status: 404 });
    }

    return NextResponse.json(role);
  } catch (error) {
    console.log("[ROLE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; roleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "roles", "update");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const body = await req.json();
    const { name, description, permissions } = body;

    // Delete existing permissions and recreate
    await prismadb.permission.deleteMany({ where: { roleId: params.roleId } });

    const role = await prismadb.role.update({
      where: { id: params.roleId },
      data: {
        name,
        description: description || null,
        permissions: {
          create: (permissions || []).map((p: { resource: string; action: string }) => ({
            resource: p.resource,
            action: p.action,
          })),
        },
      },
      include: { permissions: true },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.log("[ROLE_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; roleId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "roles", "delete");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const role = await prismadb.role.findUnique({ where: { id: params.roleId } });
    if (!role || role.storeId !== params.storeId) {
      return new NextResponse("Role not found", { status: 404 });
    }
    if (role.isSystem) {
      return new NextResponse("Cannot delete system roles", { status: 400 });
    }

    await prismadb.role.delete({ where: { id: params.roleId } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log("[ROLE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
