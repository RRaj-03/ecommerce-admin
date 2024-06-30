"use client";
import React, { useState } from "react";
import { CoupounColumn } from "./columns";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import AlertModal from "@/components/modals/alertModal";

export const CellAction = ({ data }: { data: CoupounColumn }) => {
	const router = useRouter();
	const params = useParams();
	const [loading, setLoading] = useState(false);
	const [Open, setOpen] = useState(false);
	const onCopy = (id: string) => {
		navigator.clipboard.writeText(id);
		toast.success("Coupoun id coppied to the clipboard");
	};
	const onDelete = async () => {
		try {
			setLoading(true);
			await axios.delete(`/api/${params.storeId}/coupouns/${data.id}`);
			router.refresh();
			router.push("/");
			toast.success("Coupoun deleted.");
		} catch (error) {
			toast.error(
				"Make sure you removed all categories using this coupoun first"
			);
		} finally {
			setOpen(false);
			setLoading(false);
		}
	};
	return (
		<>
			<AlertModal
				isOpen={Open}
				onClose={() => {
					setOpen(false);
				}}
				loading={loading}
				onConfirm={onDelete}
			/>
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
						Copy Id
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							router.push(`/${params.storeId}/coupouns/${data.id}`);
						}}
					>
						<Edit className="mr-2 w-4 h-4" />
						Update
					</DropdownMenuItem>
					<DropdownMenuItem
						onClick={() => {
							setOpen(true);
						}}
					>
						<Trash className="mr-2 w-4 h-4" />
						Delete
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</>
	);
};
