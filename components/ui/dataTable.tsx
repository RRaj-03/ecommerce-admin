"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  ColumnFiltersState,
  getFilteredRowModel,
  useReactTable,
  getPaginationRowModel,
  getExpandedRowModel,
  ExpandedState,
  FilterFn,
  VisibilityState,
  ColumnPinningState,
  SortingState,
  getSortedRowModel,
  Column,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "./button";
import React, { useState } from "react";
import { Input } from "./input";
import { Switch } from "./switch";
import {
  Filter,
  ArrowDownIcon,
  ArrowUpIcon,
  EyeOff,
  MoreHorizontal,
  Settings2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "./dropdown-menu";
import { Popover, PopoverTrigger, PopoverContent } from "./popover";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey: string;
  setIsPaid?: (isPaid: boolean) => void;
  isPaid?: boolean;
  renderSubComponent?: (props: { row: any }) => React.ReactNode;
}

const advancedFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
  if (!filterValue) return true;

  if (typeof filterValue === "string") {
    const rowValue = row.getValue(columnId);
    if (rowValue === null || rowValue === undefined) return false;
    return String(rowValue).toLowerCase().includes(filterValue.toLowerCase());
  }

  const { operator, value } = filterValue as {
    operator: string;
    value: string;
  };
  if (value === undefined || value === null || value === "") return true;

  const rowValue = row.getValue(columnId);
  if (rowValue === null || rowValue === undefined) return false;

  const rowValueStr = String(rowValue).toLowerCase();
  const filterValueStr = String(value).toLowerCase();
  const rowValueNum = Number(rowValue);
  const filterValueNum = Number(value);

  switch (operator) {
    case "contains":
      return rowValueStr.includes(filterValueStr);
    case "equals":
      return rowValueStr === filterValueStr;
    case "startsWith":
      return rowValueStr.startsWith(filterValueStr);
    case "endsWith":
      return rowValueStr.endsWith(filterValueStr);
    case ">":
      return (
        !isNaN(rowValueNum) &&
        !isNaN(filterValueNum) &&
        rowValueNum > filterValueNum
      );
    case "<":
      return (
        !isNaN(rowValueNum) &&
        !isNaN(filterValueNum) &&
        rowValueNum < filterValueNum
      );
    case ">=":
      return (
        !isNaN(rowValueNum) &&
        !isNaN(filterValueNum) &&
        rowValueNum >= filterValueNum
      );
    case "<=":
      return (
        !isNaN(rowValueNum) &&
        !isNaN(filterValueNum) &&
        rowValueNum <= filterValueNum
      );
    case "=":
      return (
        !isNaN(rowValueNum) &&
        !isNaN(filterValueNum) &&
        rowValueNum === filterValueNum
      );
    case "in":
      return filterValueStr
        .split(",")
        .map((v) => v.trim())
        .includes(rowValueStr);
    case "notIn":
      return !filterValueStr
        .split(",")
        .map((v) => v.trim())
        .includes(rowValueStr);
    case "not":
      return rowValueStr !== filterValueStr;
    default:
      return rowValueStr.includes(filterValueStr);
  }
};

function ColumnFilterForm({ column }: { column: Column<any, unknown> }) {
  const filterValue = column.getFilterValue() as
    | { operator: string; value: string }
    | undefined
    | string;

  let operator = "contains";
  let value = "";

  if (typeof filterValue === "string") {
    value = filterValue;
  } else if (filterValue) {
    operator = filterValue.operator || "contains";
    value = filterValue.value || "";
  }

  return (
    <div className="space-y-4 p-2">
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Operator
        </label>
        <Select
          value={operator}
          onValueChange={(op) => column.setFilterValue({ operator: op, value })}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="Select operator" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contains">Contains</SelectItem>
            <SelectItem value="equals">Equals</SelectItem>
            <SelectItem value="startsWith">Starts With</SelectItem>
            <SelectItem value="endsWith">Ends With</SelectItem>
            <SelectItem value=">">Greater Than</SelectItem>
            <SelectItem value="<">Less Than</SelectItem>
            <SelectItem value=">=">Greater Than or Equal</SelectItem>
            <SelectItem value="<=">Less Than or Equal</SelectItem>
            <SelectItem value="=">Number Equals</SelectItem>
            <SelectItem value="in">In (comma separated)</SelectItem>
            <SelectItem value="notIn">Not In</SelectItem>
            <SelectItem value="not">Not Equals</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <label className="text-xs font-medium text-muted-foreground">
          Value
        </label>
        <Input
          className="h-8"
          placeholder="Filter value..."
          value={value}
          onChange={(e) =>
            column.setFilterValue({ operator, value: e.target.value })
          }
        />
      </div>
      <Button
        variant="ghost"
        size="sm"
        className="w-full text-xs"
        onClick={() => column.setFilterValue(undefined)}
      >
        Clear Filter
      </Button>
    </div>
  );
}

function ColumnHeaderMenu({ column }: { column: Column<any, unknown> }) {
  const canFilter =
    column.getCanFilter() &&
    column.id !== "actions" &&
    column.id !== "select" &&
    column.id !== "expander";
  const canSort =
    column.getCanSort() &&
    column.id !== "actions" &&
    column.id !== "select" &&
    column.id !== "expander";
  const canPin =
    column.getCanPin() &&
    column.id !== "actions" &&
    column.id !== "select" &&
    column.id !== "expander";

  if (!canFilter && !canSort && !canPin && !column.getCanHide()) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 ml-1 data-[state=open]:bg-accent"
        >
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        {canSort && (
          <>
            <DropdownMenuItem onClick={() => column.toggleSorting(false)}>
              <ArrowUpIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Asc
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.toggleSorting(true)}>
              <ArrowDownIcon className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Desc
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {canFilter && (
          <Popover>
            <PopoverTrigger asChild>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
                Filter
              </DropdownMenuItem>
            </PopoverTrigger>
            <PopoverContent className="w-64" side="right" align="start">
              <ColumnFilterForm column={column} />
            </PopoverContent>
          </Popover>
        )}

        {canPin && (
          <>
            {(canSort || canFilter) && <DropdownMenuSeparator />}
            <DropdownMenuItem onClick={() => column.pin("left")}>
              Pin Left
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.pin("right")}>
              Pin Right
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => column.pin(false)}>
              Unpin
            </DropdownMenuItem>
          </>
        )}

        {column.getCanHide() && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => column.toggleVisibility(false)}>
              <EyeOff className="mr-2 h-3.5 w-3.5 text-muted-foreground/70" />
              Hide
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  setIsPaid,
  isPaid,
  renderSubComponent,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState("");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [columnPinning, setColumnPinning] = useState<ColumnPinningState>({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const enhancedColumns = React.useMemo(
    () =>
      columns.map((col: any) => ({
        ...col,
        filterFn: col.filterFn || advancedFilterFn,
      })),
    [columns],
  );

  const table = useReactTable({
    data,
    columns: enhancedColumns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    onColumnVisibilityChange: setColumnVisibility,
    onColumnPinningChange: setColumnPinning,
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: () => true,
    onExpandedChange: setExpanded,
    state: {
      columnFilters,
      expanded,
      globalFilter,
      columnVisibility,
      columnPinning,
      sorting,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        {setIsPaid && (
          <div className="flex items-center gap-x-2">
            <span className="text-slate-500 font-medium text-sm">Paid</span>
            <Switch
              checked={isPaid}
              onCheckedChange={(checked) => {
                setIsPaid(checked);
              }}
            />
          </div>
        )}
        <div className="flex items-center gap-x-2 ml-auto">
          <Input
            placeholder="Search all columns..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="max-w-sm h-9"
          />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-9">
                <Settings2 className="mr-2 h-4 w-4" />
                View
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[150px]">
              <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide(),
                )
                .map((column) => {
                  return (
                    <DropdownMenuCheckboxItem
                      key={column.id}
                      className="capitalize"
                      checked={column.getIsVisible()}
                      onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                      }
                    >
                      {column.id}
                    </DropdownMenuCheckboxItem>
                  );
                })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const isPinned = header.column.getIsPinned();
                  return (
                    <TableHead
                      key={header.id}
                      style={{
                        position: isPinned ? "sticky" : "static",
                        left:
                          isPinned === "left"
                            ? `${header.column.getStart("left")}px`
                            : undefined,
                        right:
                          isPinned === "right"
                            ? `${header.column.getAfter("right")}px`
                            : undefined,
                        zIndex: isPinned ? 10 : 0,
                        backgroundColor: isPinned ? "white" : "inherit",
                        boxShadow:
                          isPinned === "left"
                            ? "2px 0 4px -2px rgba(0,0,0,0.1)"
                            : isPinned === "right"
                              ? "-2px 0 4px -2px rgba(0,0,0,0.1)"
                              : undefined,
                      }}
                    >
                      {header.isPlaceholder ? null : (
                        <div className="flex items-center">
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          <ColumnHeaderMenu column={header.column} />
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <React.Fragment key={row.id}>
                  <TableRow data-state={row.getIsSelected() && "selected"}>
                    {row.getVisibleCells().map((cell) => {
                      const isPinned = cell.column.getIsPinned();
                      return (
                        <TableCell
                          key={cell.id}
                          style={{
                            position: isPinned ? "sticky" : "static",
                            left:
                              isPinned === "left"
                                ? `${cell.column.getStart("left")}px`
                                : undefined,
                            right:
                              isPinned === "right"
                                ? `${cell.column.getAfter("right")}px`
                                : undefined,
                            zIndex: isPinned ? 10 : 0,
                            backgroundColor: isPinned ? "white" : "inherit",
                            boxShadow:
                              isPinned === "left"
                                ? "2px 0 4px -2px rgba(0,0,0,0.1)"
                                : isPinned === "right"
                                  ? "-2px 0 4px -2px rgba(0,0,0,0.1)"
                                  : undefined,
                          }}
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext(),
                          )}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                  {row.getIsExpanded() && renderSubComponent && (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="p-0 bg-slate-50/50"
                      >
                        {renderSubComponent({ row })}
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="text-muted-foreground text-sm flex-1">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
