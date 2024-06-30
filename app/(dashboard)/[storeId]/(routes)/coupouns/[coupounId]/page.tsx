import prismadb from "@/lib/prismadb";
import React from "react";
import CoupounForm from "../components/coupounsForm";

const CoupounPage = async ({ params }: { params: { coupounId: string } }) => {
	const coupoun = await prismadb.coupouns.findUnique({
		where: {
			id: params.coupounId,
		},
	});
	const newcoupoun = {
		...coupoun,
		amount: parseFloat(String(coupoun?.amount)),
		percentage: parseFloat(String(coupoun?.percentage)),
	};
	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<CoupounForm initialData={coupoun} />
			</div>
		</div>
	);
};

export default CoupounPage;
