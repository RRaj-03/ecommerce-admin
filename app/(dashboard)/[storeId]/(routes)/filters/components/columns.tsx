"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";

export type FilterColumn = {
  id: string;
  name: string;
  createdAt: string;
};

export const columns: ColumnDef<FilterColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
