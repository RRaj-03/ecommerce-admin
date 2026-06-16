import prismadb from "@/lib/prismadb";
import { Resource, Action, Scope } from "@/lib/permissions";

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
  const store = await prismadb.store.findUnique({
    where: { id: storeId },
    select: { userId: true },
  });

  if (!store) return false;
  if (store.userId === userId) return true;

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
 * Require a permission — returns 403 info if denied.
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
 * Get the scope for a specific permission.
 * Owner always gets "all".
 */
export async function getPermissionScope(
  userId: string,
  storeId: string,
  resource: Resource,
  action: Action
): Promise<Scope> {
  const store = await prismadb.store.findUnique({
    where: { id: storeId },
    select: { userId: true },
  });

  if (!store) return "assigned";
  if (store.userId === userId) return "all";

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

  if (!member || member.role.permissions.length === 0) return "assigned";
  return (member.role.permissions[0].scope as Scope) || "all";
}

/**
 * Get all permissions for a user on a store.
 */
export async function getUserPermissions(
  userId: string,
  storeId: string
): Promise<{
  isOwner: boolean;
  permissions: Set<string>;
  permissionDetails: { resource: string; action: string; scope: string }[];
  roleLevel: number;
  canDelegate: boolean;
  memberId: string | null;
}> {
  const store = await prismadb.store.findUnique({
    where: { id: storeId },
    select: { userId: true },
  });

  const defaultResult = {
    isOwner: false,
    permissions: new Set<string>(),
    permissionDetails: [],
    roleLevel: 999,
    canDelegate: false,
    memberId: null as string | null,
  };

  if (!store) return defaultResult;

  if (store.userId === userId) {
    return {
      isOwner: true,
      permissions: new Set(["*"]),
      permissionDetails: [],
      roleLevel: 0,
      canDelegate: true,
      memberId: null,
    };
  }

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

  if (!member) return defaultResult;

  const permissions = new Set(
    member.role.permissions.map((p) => `${p.resource}:${p.action}`)
  );

  return {
    isOwner: false,
    permissions,
    permissionDetails: member.role.permissions.map((p) => ({
      resource: p.resource,
      action: p.action,
      scope: p.scope,
    })),
    roleLevel: member.role.level,
    canDelegate: member.role.canDelegate,
    memberId: member.id,
  };
}

/**
 * Check if a user has access to a store (owner or member).
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

/**
 * Get all subordinate member IDs recursively for a given member.
 */
export async function getSubordinateIds(memberId: string): Promise<string[]> {
  const directs = await prismadb.storeMember.findMany({
    where: { managerId: memberId },
    select: { id: true },
  });

  const ids: string[] = directs.map((d) => d.id);
  for (const direct of directs) {
    const nested = await getSubordinateIds(direct.id);
    ids.push(...nested);
  }
  return ids;
}

/**
 * Validate that a role being created/updated respects delegation rules.
 * The creator can only grant permissions they themselves have,
 * and the new role's level must be higher (less powerful) than theirs.
 */
export async function validateDelegatedRole(
  creatorUserId: string,
  storeId: string,
  newRoleLevel: number,
  newPermissions: { resource: string; action: string; scope?: string }[]
): Promise<{ valid: true } | { valid: false; reason: string }> {
  const creatorPerms = await getUserPermissions(creatorUserId, storeId);

  if (creatorPerms.isOwner) return { valid: true };

  if (!creatorPerms.canDelegate) {
    return { valid: false, reason: "Your role does not allow creating new roles" };
  }

  if (newRoleLevel <= creatorPerms.roleLevel) {
    return {
      valid: false,
      reason: `New role level (${newRoleLevel}) must be greater than your level (${creatorPerms.roleLevel})`,
    };
  }

  // Check each permission is a subset of creator's permissions
  for (const perm of newPermissions) {
    const key = `${perm.resource}:${perm.action}`;
    if (!creatorPerms.permissions.has(key) && !creatorPerms.permissions.has("*")) {
      return {
        valid: false,
        reason: `You cannot grant "${key}" — you don't have this permission yourself`,
      };
    }
  }

  return { valid: true };
}
