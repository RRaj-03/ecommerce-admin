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
			Products: true,
			user: true,
			address: true,
			coupouns: true,
		},
	});
	const formattedOrders: OrderColumn[] = orders.map((item) => ({
		userId: item.userId,
		fullName: item.user.firstName + " " + item.user.lastName,
		emailAddress: item.user.email,
		phoneNumber: item.address.phoneNumber,
		id: item.id,
		phone: item.phone,
		address: `${item.address.name}\n${item.address.line1}, ${item.address?.line2}, ${item.address.street}, ${item.address.city}, ${item.address.state}, ${item.address.country} - ${item.address.postalCode}`,
		products: item.Products.map((orderItem) => orderItem.name).join(", "),
		totalPrice: formatter.format(parseFloat(String(item.total))),
		subtotal: formatter.format(parseFloat(String(item.subtotal))),
		discount: formatter.format(parseFloat(String(item.discount))),
		paidAmount: formatter.format(parseFloat(String(item.paidAmount))),
		paidAt: item.paidAt ? format(item.paidAt, "MMMM do, yyyy") : "",
		coupounCode: item?.coupouns?.code || "",
		transactionId: item.transactionId,
		isPaid: item.isPaid,
		createdAt: format(item.createdAt, "MMMM do, yyyy"),
		status: item.orderStatus,
	}));

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<OrdersClient data={formattedOrders} />
			</div>
		</div>
	);
};

export default Orders;
