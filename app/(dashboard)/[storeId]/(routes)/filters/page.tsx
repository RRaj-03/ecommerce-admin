import React from "react";
import FiltersClient from "./components/filtersClient";
import prismadb from "@/lib/prismadb";
import { FilterColumn } from "./components/columns";
import { format } from "date-fns";
const Filters = async ({ params }: { params: { storeId: string } }) => {
  const filters = await prismadb.filter.findMany({
    where: { storeId: params.storeId },
    orderBy: {
      createdAt: "desc",
    },
  });
  const formattedFilters: FilterColumn[] = filters.map((item) => ({
    id: item.id,
    name: item.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <FiltersClient data={formattedFilters} />
      </div>
    </div>
  );
};

export default Filters;
