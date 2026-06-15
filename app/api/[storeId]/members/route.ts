import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { requirePermission } from "@/lib/rbac";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const check = await requirePermission(userId, params.storeId, "roles", "view");
    if (!check.allowed) return new NextResponse(check.message, { status: check.status });

    const members = await prismadb.storeMember.findMany({
      where: { storeId: params.storeId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "asc" },
    });

    // Also get the store owner
    const store = await prismadb.store.findUnique({
      where: { id: params.storeId },
      select: { userId: true },
    });

    const owner = store
      ? await prismadb.adminUser.findUnique({
          where: { id: store.userId },
          select: { id: true, name: true, email: true },
        })
      : null;

    // Get pending invites
    const invites = await prismadb.storeInvite.findMany({
      where: { storeId: params.storeId, status: "pending" },
      include: {
        role: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ owner, members, invites });
  } catch (error) {
    console.log("[MEMBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Invite a new member by email
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
    const { email, roleId } = body;

    if (!email) return new NextResponse("Email is required", { status: 400 });
    if (!roleId) return new NextResponse("Role is required", { status: 400 });

    // Check the role exists and belongs to this store
    const role = await prismadb.role.findFirst({
      where: { id: roleId, storeId: params.storeId },
    });
    if (!role) return new NextResponse("Role not found", { status: 404 });

    // Check if user is already a member
    const existingUser = await prismadb.adminUser.findUnique({
      where: { email },
    });
    if (existingUser) {
      const existingMember = await prismadb.storeMember.findUnique({
        where: { storeId_userId: { storeId: params.storeId, userId: existingUser.id } },
      });
      if (existingMember) {
        return new NextResponse("User is already a member of this store", { status: 400 });
      }

      // If user exists, add them directly
      const member = await prismadb.storeMember.create({
        data: {
          storeId: params.storeId,
          userId: existingUser.id,
          roleId,
        },
        include: {
          user: { select: { id: true, name: true, email: true } },
          role: { select: { id: true, name: true } },
        },
      });

      return NextResponse.json({ type: "member_added", member });
    }

    // User doesn't exist — create an invite
    // Delete any existing pending invite for this email
    await prismadb.storeInvite.deleteMany({
      where: { storeId: params.storeId, email, status: "pending" },
    });

    const invite = await prismadb.storeInvite.create({
      data: {
        storeId: params.storeId,
        email,
        roleId,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      include: {
        role: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json({ type: "invite_created", invite });
  } catch (error) {
    console.log("[MEMBERS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
