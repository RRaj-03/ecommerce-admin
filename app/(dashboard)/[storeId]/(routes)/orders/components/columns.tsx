"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";

export type OrderColumn = {
  id: string;
  phone: string;
  address: string;
  isPaid: boolean;
  amount: string;
  tax: string;
  total: string;
  products: string;
  createdAt: string;
  fullName: string;
  phoneNumber: string;
  emailAddress: string;
  userId: string;
  transactionId: string;
  status: string;
  paymentMethod: string;
  orderItemsRaw: any[];
};

export const columns: ColumnDef<OrderColumn>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <button
          {...{
            onClick: row.getToggleExpandedHandler(),
            style: { cursor: "pointer" },
          }}
          className="p-1 hover:bg-slate-100 rounded"
        >
          {row.getIsExpanded() ? "▼" : "▶"}
        </button>
      ) : null;
    },
  },
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
    accessorKey: "amount",
    header: "Amount",
  },
  {
    accessorKey: "tax",
    header: "Tax",
  },
  {
    accessorKey: "total",
    header: "Total",
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment",
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
