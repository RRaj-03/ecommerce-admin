import prismadb from "@/lib/prismadb";
import { Resource, Action } from "@/lib/permissions";

/**
 * Check if a user has a specific permission on a store.
 * The store OWNER always has full access.
 */
export async function checkPermission(
  userId: string,
  storeId: string,
  resource: Resource,
  action: Action
): Promise<boolean> {
  // 1. Check if user is the store owner — always has full access
  const store = await prismadb.store.findUnique({
    where: { id: storeId },
    select: { userId: true },
  });

  if (!store) return false;
  if (store.userId === userId) return true;

  // 2. Check if user is a member with the required permission
  const member = await prismadb.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId } },
    include: {
      role: {
        include: {
          permissions: {
            where: { resource, action },
          },
        },
      },
    },
  });

  if (!member) return false;
  return member.role.permissions.length > 0;
}

/**
 * Require a permission — returns a NextResponse 403 if denied.
 * Use in API routes.
 */
export async function requirePermission(
  userId: string | null,
  storeId: string,
  resource: Resource,
  action: Action
): Promise<{ allowed: true } | { allowed: false; status: number; message: string }> {
  if (!userId) {
    return { allowed: false, status: 401, message: "Unauthenticated" };
  }

  const allowed = await checkPermission(userId, storeId, resource, action);
  if (!allowed) {
    return {
      allowed: false,
      status: 403,
      message: `You do not have permission to ${action} ${resource}`,
    };
  }

  return { allowed: true };
}

/**
 * Get all permissions for a user on a store.
 * Returns a Set of "resource:action" strings for quick lookups.
 * The owner gets all permissions.
 */
export async function getUserPermissions(
  userId: string,
  storeId: string
): Promise<{ isOwner: boolean; permissions: Set<string> }> {
  const store = await prismadb.store.findUnique({
    where: { id: storeId },
    select: { userId: true },
  });

  if (!store) return { isOwner: false, permissions: new Set() };

  // Owner has all permissions
  if (store.userId === userId) {
    return { isOwner: true, permissions: new Set(["*"]) };
  }

  // Find member and their role's permissions
  const member = await prismadb.storeMember.findUnique({
    where: { storeId_userId: { storeId, userId } },
    include: {
      role: {
        include: {
          permissions: true,
        },
      },
    },
  });

  if (!member) return { isOwner: false, permissions: new Set() };

  const permissions = new Set(
    member.role.permissions.map((p) => `${p.resource}:${p.action}`)
  );

  return { isOwner: false, permissions };
}

/**
 * Check if a user has access to a store (either as owner or member).
 */
export async function hasStoreAccess(
  userId: string,
  storeId: string
): Promise<boolean> {
  const store = await prismadb.store.findFirst({
    where: {
      id: storeId,
      OR: [{ userId }, { members: { some: { userId } } }],
    },
  });

  return !!store;
}
