"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  totalPrice: string;
  products: string;
  createdAt: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  userId: string;
  transactionId: string;
  status: string;
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    accessorKey: "products",
    header: "Products",
  },
  {
    accessorKey: "userId",
    header: "User Id",
  },
  {
    accessorKey: "fullName",
    header: "User Name",
  },
  {
    accessorKey: "emailAddress",
    header: "User email",
  },
  {
    accessorKey: "phone",
    header: "Shipping Number",
  },
  {
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "totalPrice",
    header: "Total Price",
  },
  {
    accessorKey: "transactionId",
    header: "Transaction Id",
  },
  {
    accessorKey: "isPaid",
    header: "Paid",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
