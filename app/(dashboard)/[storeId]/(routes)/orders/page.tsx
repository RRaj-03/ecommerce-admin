import React from "react";
import OrdersClient from "./components/ordersClient";
import prismadb from "@/lib/prismadb";
import { OrderColumn } from "./components/columns";
import { format } from "date-fns";
import { formatter } from "@/lib/utils";
const Orders = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: { storeId: params.storeId },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      orderItems: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
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
      products: item.orderItems
        .map((orderItem) => orderItem.product.name)
        .join(", "),
      amount: formatter.format(subtotal),
      tax: formatter.format(tax),
      total: formatter.format(total),
      paymentMethod: item.paymentMethod || "stripe",
      transactionId: item.transactionId,
      isPaid: item.isPaid,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
      status: item.orderStatus,
      orderItemsRaw: item.orderItems,
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrdersClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default Orders;
