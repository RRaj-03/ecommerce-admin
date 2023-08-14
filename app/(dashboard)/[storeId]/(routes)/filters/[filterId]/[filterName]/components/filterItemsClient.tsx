"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { FilterItem } from "@prisma/client";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { FilterItemColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import { ApiListFilter } from "@/components/ui/apiListFilter";

const FilterItemsClient = ({ data }: { data: FilterItemColumn[] }) => {
  const router = useRouter();
  const params = useParams();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`${params.filterName}s (${data.length})`}
          desc="Manage filterItems for your store"
        />
        <Button
          onClick={() => {
            router.push(
              `/${params.storeId}/filters/${params.filterId}/${params.filterName}/new`
            );
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
      <Heading title="API" desc="API calls for FilterItems" />
      <Separator />
      <ApiListFilter entityName="filterItems" entityIdName="filterItemId" />
    </>
  );
};

export default FilterItemsClient;
