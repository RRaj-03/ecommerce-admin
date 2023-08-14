import React from "react";
import FilterItemsClient from "./components/filterItemsClient";
import prismadb from "@/lib/prismadb";
import { FilterItemColumn } from "./components/columns";
import { format } from "date-fns";
const FilterItems = async ({
  params,
}: {
  params: { storeId: string; filterId: string };
}) => {
  const filterItems = await prismadb.filterItem.findMany({
    where: { storeId: params.storeId, filterId: params.filterId },
    orderBy: {
      createdAt: "desc",
    },
  });
  const formattedFilterItems: FilterItemColumn[] = filterItems.map((item) => ({
    id: item.id,
    name: item.name,
    value: item.value,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <FilterItemsClient data={formattedFilterItems} />
      </div>
    </div>
  );
};

export default FilterItems;
