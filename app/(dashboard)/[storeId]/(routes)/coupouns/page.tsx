import React from "react";
import CoupounsClient from "./components/coupounsClient";
import prismadb from "@/lib/prismadb";
import { CoupounColumn } from "./components/columns";
import { format } from "date-fns";
const Coupouns = async ({ params }: { params: { storeId: string } }) => {
	const coupouns = await prismadb.coupouns.findMany({
		where: { storeId: params.storeId },
		orderBy: {
			createdAt: "desc",
		},
	});
	const formattedCoupouns: CoupounColumn[] = coupouns.map((item) => ({
		id: item.id,
		code: item.code,
		amount: parseFloat(String(item.amount)),
		percentage: parseFloat(String(item.percentage)),
		useBy: format(item.useBy, "MMMM do, yyyy"),
		oneTime: item.oneTime,
		archived: item.archived,
		fixed: item.fixed,
		createdAt: format(item.createdAt, "MMMM do, yyyy"),
		updatedAt: format(item.updatedAt, "MMMM do, yyyy"),
		description: item.description,
	}));

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<CoupounsClient data={formattedCoupouns} />
			</div>
		</div>
	);
};

export default Coupouns;
