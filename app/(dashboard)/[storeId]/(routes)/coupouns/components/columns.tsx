"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";

export type CoupounColumn = {
	id: string;
	code: string;
	description: string;
	amount: number;
	percentage: number;
	useBy: string;
	oneTime: boolean;
	archived: boolean;
	fixed: boolean;
	createdAt: string;
	updatedAt: string;
};

export const columns: ColumnDef<CoupounColumn>[] = [
	{
		accessorKey: "id",
		header: "ID",
	},
	{
		accessorKey: "code",
		header: "Code",
	},
	{
		accessorKey: "description",
		header: "Description",
	},
	{
		accessorKey: "amount",
		header: "Amount",
	},
	{
		accessorKey: "percentage",
		header: "Percentage",
	},
	{
		accessorKey: "useBy",
		header: "Use By",
	},
	{
		accessorKey: "oneTime",
		header: "One Time",
	},
	{
		accessorKey: "archived",
		header: "Archived",
	},
	{
		accessorKey: "fixed",
		header: "Fixed",
	},
	{
		accessorKey: "createdAt",
		header: "Created At",
	},
	{
		accessorKey: "updatedAt",
		header: "Updated At",
	},
	{
		id: "actions",
		cell: ({ row }) => <CellAction data={row.original} />,
	},
];
