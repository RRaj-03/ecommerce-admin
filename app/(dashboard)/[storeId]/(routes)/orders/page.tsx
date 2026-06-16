import React from "react";
import OrdersClient from "./components/ordersClient";
import prismadb from "@/lib/prismadb";
import { OrderColumn } from "./components/columns";
import { format } from "date-fns";
import { formatter } from "@/lib/utils";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUserPermissions, getSubordinateIds, getPermissionScope } from "@/lib/rbac";

const Orders = async ({
  params,
  searchParams,
}: {
  params: { storeId: string };
  searchParams: { tab?: string };
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  // Get permissions
  const perms = await getUserPermissions(userId, params.storeId);
  const canView = perms.isOwner || perms.permissions.has("*") || perms.permissions.has("orders:view");
  const canAssign = perms.isOwner || perms.permissions.has("*") || perms.permissions.has("orders:assign");
  const canUpdateStatus = perms.isOwner || perms.permissions.has("*") || perms.permissions.has("orders:update");

  if (!canView) {
    redirect(`/${params.storeId}`);
  }

  const viewScope = await getPermissionScope(userId, params.storeId, "orders", "view");
  const assignScope = await getPermissionScope(userId, params.storeId, "orders", "assign");

  let subordinateIds: string[] = [];
  if (perms.memberId) {
    subordinateIds = await getSubordinateIds(perms.memberId);
  }

  // Determine assignable members
  let assignableMembers: any[] = [];
  if (canAssign) {
    if (perms.isOwner || assignScope === "all") {
      // Can assign to anyone in the store
      const members = await prismadb.storeMember.findMany({
        where: { storeId: params.storeId },
        include: { user: { select: { name: true } }, role: { select: { name: true } } },
      });
      assignableMembers = members.map((m) => ({
        id: m.id,
        name: m.user.name,
        roleName: m.role.name,
      }));
    } else if (assignScope === "subordinates" && perms.memberId) {
      // Can assign to self + subordinates
      const ids = [perms.memberId, ...subordinateIds];
      const members = await prismadb.storeMember.findMany({
        where: { id: { in: ids } },
        include: { user: { select: { name: true } }, role: { select: { name: true } } },
      });
      assignableMembers = members.map((m) => ({
        id: m.id,
        name: m.id === perms.memberId ? `${m.user.name} (Me)` : m.user.name,
        roleName: m.role.name,
      }));
    } else if (assignScope === "assigned" && perms.memberId) {
      // Can only assign to self
      const member = await prismadb.storeMember.findUnique({
        where: { id: perms.memberId },
        include: { user: { select: { name: true } }, role: { select: { name: true } } },
      });
      if (member) {
        assignableMembers = [
          { id: member.id, name: `${member.user.name} (Me)`, roleName: member.role.name },
        ];
      }
    }
  }

  // Filter orders based on scope and active tab
  const tab = searchParams.tab || "all";
  let whereClause: any = { storeId: params.storeId };

  if (!perms.isOwner && viewScope !== "all") {
    if (viewScope === "subordinates" && perms.memberId) {
      // If "All" tab is selected, but scope is subordinates, limit to (self + subordinates + unassigned maybe? usually just assigned to them)
      whereClause.assignedToId = { in: [perms.memberId, ...subordinateIds] };
    } else if (perms.memberId) {
      // Scope "assigned"
      whereClause.assignedToId = perms.memberId;
    }
  }

  // Apply tab filters if they are more restrictive than the scope
  if (tab === "assigned_to_me" && perms.memberId) {
    whereClause.assignedToId = perms.memberId;
  } else if (tab === "my_team" && perms.memberId) {
    whereClause.assignedToId = { in: subordinateIds };
  }

  const orders = await prismadb.order.findMany({
    where: whereClause,
    orderBy: { createdAt: "desc" },
    include: {
      assignedTo: {
        include: { user: { select: { name: true } } }
      },
      orderItems: {
        include: { product: { include: { images: true } } },
      },
    },
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => {
    const subtotal = item.orderItems.reduce((total, oi) => {
      const price = oi.priceAtTime ? Number(oi.priceAtTime) : Number(oi.product.price);
      return total + price * (oi.quantity || 1);
    }, 0);
    const tax = Number(item.taxAmount) || 0;
    const total = Number(item.totalAmount) > 0 ? Number(item.totalAmount) : subtotal;

    return {
      userId: item.userId,
      fullName: item.firstName + " " + item.lastName,
      emailAddress: item.emailAddress,
      phoneNumber: item.phoneNumber,
      id: item.id,
      phone: item.phone,
      address: item.address,
      products: item.orderItems.map((orderItem) => orderItem.product.name).join(", "),
      amount: formatter.format(subtotal),
      tax: formatter.format(tax),
      total: formatter.format(total),
      paymentMethod: item.paymentMethod || "stripe",
      transactionId: item.transactionId,
      isPaid: item.isPaid,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
      status: item.orderStatus,
      assigneeName: item.assignedTo?.user?.name || null,
      orderItemsRaw: item.orderItems,
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient
          data={formattedOrders}
          assignableMembers={assignableMembers}
          canAssign={canAssign}
          canUpdateStatus={canUpdateStatus}
          activeTab={tab}
        />
      </div>
    </div>
  );
};

export default Orders;
