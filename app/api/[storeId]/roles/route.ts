import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requirePermission, validateDelegatedRole } from "@/lib/rbac";
import { DEFAULT_ROLES } from "@/lib/permissions";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "roles", "view");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const roles = await prismadb.role.findMany({
      where: { storeId: params.storeId },
      include: {
        permissions: true,
        _count: { select: { members: true } },
      },
      orderBy: [{ level: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json(roles);
  } catch (error) {
    console.log("[ROLES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "roles", "create");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const body = await req.json();
    const { name, description, permissions, level, canDelegate } = body;

    if (!name) return new NextResponse("Name is required", { status: 400 });

    // Validate delegation rules
    const validation = await validateDelegatedRole(
      userId,
      params.storeId,
      level || 100,
      permissions || []
    );
    if (!validation.valid) {
      return new NextResponse(validation.reason, { status: 403 });
    }

    const role = await prismadb.role.create({
      data: {
        storeId: params.storeId,
        name,
        description: description || null,
        level: level || 100,
        canDelegate: canDelegate || false,
        permissions: {
          create: (permissions || []).map((p: { resource: string; action: string; scope?: string }) => ({
            resource: p.resource,
            action: p.action,
            scope: p.scope || "all",
          })),
        },
      },
      include: { permissions: true },
    });

    return NextResponse.json(role);
  } catch (error) {
    console.log("[ROLES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PUT — seed default roles for a store
export async function PUT(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const store = await prismadb.store.findUnique({
      where: { id: params.storeId },
      select: { userId: true },
    });
    if (!store || store.userId !== userId) {
      return new NextResponse("Only the owner can initialize roles", { status: 403 });
    }

    const existingRoles = await prismadb.role.findMany({
      where: { storeId: params.storeId },
    });
    if (existingRoles.length > 0) {
      return NextResponse.json({ message: "Roles already exist", roles: existingRoles });
    }

    const createdRoles = [];
    for (const roleDef of DEFAULT_ROLES) {
      const role = await prismadb.role.create({
        data: {
          storeId: params.storeId,
          name: roleDef.name,
          description: roleDef.description,
          isSystem: true,
          level: roleDef.level,
          canDelegate: roleDef.canDelegate,
          permissions: {
            create: roleDef.permissions.map((p) => ({
              resource: p.resource,
              action: p.action,
              scope: p.scope || "all",
            })),
          },
        },
        include: { permissions: true },
      });
      createdRoles.push(role);
    }

    return NextResponse.json(createdRoles);
  } catch (error) {
    console.log("[ROLES_SEED]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
