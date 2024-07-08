"use client";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import React, { useEffect, useState } from "react";
import { OrderColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";

const OrdersClient = ({ data: initialData }: { data: OrderColumn[] }) => {
	const [isPaid, setIsPaid] = useState(true);
	const [data, setData] = useState<OrderColumn[]>(initialData);

	useEffect(() => {
		const newData = initialData.filter((item) => {
			return item.isPaid === isPaid;
		});
		setData(newData);
	}, [isPaid, initialData]);
	return (
		<>
			<Heading
				title={`Order (${data.length})`}
				desc="Manage orders for your store"
			/>

			<Separator />
			<div className="overflow-x-hidden">
				<DataTable
					columns={columns}
					data={data}
					searchKey="products"
					setIsPaid={setIsPaid}
					isPaid={isPaid}
				/>
			</div>
		</>
	);
};

export default OrdersClient;
