import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getUserPermissions } from "@/lib/rbac";

/**
 * Returns the current user's permissions for this store.
 * Used by the navbar and UI to conditionally show/hide elements.
 */
export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    const { isOwner, permissions } = await getUserPermissions(userId, params.storeId);

    return NextResponse.json({
      isOwner,
      permissions: Array.from(permissions),
    });
  } catch (error) {
    console.log("[MY_PERMISSIONS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
