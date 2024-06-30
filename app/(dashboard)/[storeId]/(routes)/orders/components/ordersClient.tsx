"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Order } from "@prisma/client";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { OrderColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import { ApiList } from "@/components/ui/apiList";

const OrdersClient = ({ data: initialData }: { data: OrderColumn[] }) => {
	const [isPaid, setIsPaid] = useState(true);
	const [data, setData] = useState<OrderColumn[]>(initialData);
	const router = useRouter();
	const params = useParams();

	useEffect(() => {
		const newData = initialData.filter((item) => {
			return item.isPaid === isPaid;
		});
		setData(newData);
	}, [isPaid]);
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
