"use client";
import React, { useEffect, useState } from "react";
import { OrderColumn } from "./columns";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuRadioGroup,
	DropdownMenuRadioItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, MoreHorizontal } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";

export const CellAction = ({ data }: { data: OrderColumn }) => {
	const router = useRouter();
	const params = useParams();
	const [loading, setLoading] = useState(false);
	const onCopy = (id: string) => {
		navigator.clipboard.writeText(id);
		toast.success("Product id coppied to the clipboard");
	};
	const onCancel = async () => {
		try {
			setLoading(true);
			await axios.post(`/api/${params.storeId}/orders/${data.id}/cancel`);
			toast.success("Order Updated.");
		} catch (error) {
			toast.error("Something Went Wrong.");
		} finally {
			setLoading(false);
		}
	};
	const onRefundInitate = async () => {
		try {
			setLoading(true);
			await axios.post(`/api/${params.storeId}/orders/${data.id}/refund`);
			toast.success("Order Updated.");
		} catch (error) {
			toast.error("Something Went Wrong.");
		} finally {
			setLoading(false);
		}
	};
	const onStatusChange = async (value: string) => {
		try {
			setLoading(true);
			await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
				status: value,
			});
			toast.success("Order Updated.");
		} catch (error) {
			toast.error("Something Went Wrong.");
		} finally {
			setLoading(false);
		}
	};
	const refresh = () => {
		router.refresh();
	};
	const labels = [
		{
			name: "Unpaid",
			value: "Unpaid",
		},
		{
			name: "Paid",
			value: "Paid",
		},
		{
			name: "Processing",
			value: "Processing",
		},
		{
			name: "Shipped",
			value: "Shipped",
		},
		{
			name: "Arrived",
			value: "Arrived",
		},
		{
			name: "Departed",
			value: "Departed",
		},
		{
			name: "Delivered",
			value: "Delivered",
		},
	];

	return (
		<>
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant={"ghost"} className="h-8 w-8 p-0">
						<span className="sr-only">Open Menu</span>
						<MoreHorizontal className="h-4 w-4" />
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent align="end">
					<DropdownMenuLabel>Actions</DropdownMenuLabel>
					<DropdownMenuItem
						onClick={() => {
							onCopy(data.id);
						}}
					>
						<Copy className="mr-2 w-4 h-4" />
						Copy Order Id
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							onCopy(data.transactionId);
						}}
					>
						<Copy className="mr-2 w-4 h-4" />
						Copy Transaction Id
					</DropdownMenuItem>
					{data.status !== "Cancelled" &&
						data.status !== "Refunded" &&
						data.status !== "RefundInitiated" && (
							<>
								<DropdownMenuSeparator />
								<DropdownMenuSub>
									<DropdownMenuSubTrigger>Status</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuRadioGroup
											value={data.status}
											onValueChange={async (value) => {
												console.log("value", value);
												await onStatusChange(value);
												refresh();
											}}
										>
											{labels.map((label) => (
												<DropdownMenuRadioItem
													key={label.value}
													value={label.value}
												>
													{label.name}
												</DropdownMenuRadioItem>
											))}
										</DropdownMenuRadioGroup>
									</DropdownMenuSubContent>
								</DropdownMenuSub>
							</>
						)}
					{data.status !== "Refunded" && data.status !== "RefundInitiated" && (
						<>
							<DropdownMenuSeparator />
							<DropdownMenuItem
								onClick={async () => {
									if (data.status === "Cancelled") {
										await onRefundInitate();
									} else {
										await onCancel();
									}
								}}
							>
								Cancel
							</DropdownMenuItem>
						</>
					)}
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
