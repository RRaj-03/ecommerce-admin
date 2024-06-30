import prismadb from "@/lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
	const paidOrders = await prismadb.order.findMany({
		where: {
			storeId,
			isPaid: true,
		},
		include: {
			Products: true,
		},
	});

	const totalRevenue = paidOrders.reduce((total, order) => {
		const totalOrder = parseFloat(String(order.total));
		return total + totalOrder;
	}, 0);
	return totalRevenue;
};
