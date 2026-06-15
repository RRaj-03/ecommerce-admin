"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";

export type PageColumn = {
  id: string;
  title: string;
  slug: string;
  isPublished: string;
  createdAt: string;
};

export const columns: ColumnDef<PageColumn>[] = [
  {
    accessorKey: "title",
    header: "Title",
  },
  {
    accessorKey: "slug",
    header: "URL Slug",
  },
  {
    accessorKey: "isPublished",
    header: "Published",
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
