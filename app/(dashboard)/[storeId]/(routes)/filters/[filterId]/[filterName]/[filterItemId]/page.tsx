import prismadb from "@/lib/prismadb";
import React from "react";
import FilterItemForm from "../components/filterItemForm";
import { auth } from "@clerk/nextjs";

const FilterItemPage = async ({
  params,
}: {
  params: { filterItemId: string };
}) => {
  const { userId } = auth();
  const filterItem = await prismadb.filterItem.findUnique({
    where: {
      id: params.filterItemId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <FilterItemForm initialData={filterItem} />
      </div>
    </div>
  );
};

export default FilterItemPage;
