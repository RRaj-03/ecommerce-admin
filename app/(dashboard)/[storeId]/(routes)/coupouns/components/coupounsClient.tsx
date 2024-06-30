"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { CoupounColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import { ApiList } from "@/components/ui/apiList";

const CoupounsClient = ({ data }: { data: CoupounColumn[] }) => {
	const router = useRouter();
	const params = useParams();
	return (
		<>
			<div className="flex items-center justify-between">
				<Heading
					title={`Coupoun (${data.length})`}
					desc="Manage coupouns for your store"
				/>
				<Button
					onClick={() => {
						router.push(`/${params.storeId}/coupouns/new`);
					}}
				>
					<Plus className="h-4 w-4 mr-2" /> Add New
				</Button>
			</div>
			<Separator />
			<DataTable columns={columns} data={data} searchKey="label" />
			<Heading title="API" desc="API calls for Coupouns" />
			<Separator />
			<ApiList entityName="coupouns" entityIdName="coupounId" />
		</>
	);
};

export default CoupounsClient;
