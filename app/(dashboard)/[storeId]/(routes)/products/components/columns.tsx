"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";
export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  filterItemIds: {
    label: string;
    value: string;
  }[];
  isFeatured: boolean;
  isArchived: boolean;
  createdAt: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "isArchived",
    header: "Archived",
  },
  {
    accessorKey: "isFeatured",
    header: "Featured",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "category",
    header: "Category",
  },
  {
    accessorKey: "filterItemIds",
    header: "Info",
    cell: ({ row }) => (
      <div className="">
        {row.original.filterItemIds.map((item) => (
          <div className="flex items-center  gap-x-2">
            <span className="font-medium">{item.label}:</span>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    ),
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
