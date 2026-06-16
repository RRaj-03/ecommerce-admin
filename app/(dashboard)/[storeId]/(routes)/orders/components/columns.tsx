"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cellAction";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

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
  assigneeName: string | null;
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
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
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
    accessorKey: "assigneeName",
    header: "Assigned To",
    cell: ({ row }) => {
      const name = row.original.assigneeName;
      return name ? <Badge variant="secondary">{name}</Badge> : <span className="text-muted-foreground text-xs">Unassigned</span>;
    }
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
