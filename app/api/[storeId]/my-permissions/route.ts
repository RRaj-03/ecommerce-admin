import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUserPermissions } from "@/lib/rbac";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const result = await getUserPermissions(userId, params.storeId);

    return NextResponse.json({
      isOwner: result.isOwner,
      permissions: Array.from(result.permissions),
      permissionDetails: result.permissionDetails,
      roleLevel: result.roleLevel,
      canDelegate: result.canDelegate,
      memberId: result.memberId,
    });
  } catch (error) {
    console.log("[MY_PERMISSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
