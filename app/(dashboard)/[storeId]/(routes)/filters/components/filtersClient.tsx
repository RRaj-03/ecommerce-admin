"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Filter } from "@/generated/prisma/client";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { FilterColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import { ApiList } from "@/components/ui/apiList";

const FiltersClient = ({ data }: { data: FilterColumn[] }) => {
  const router = useRouter();
  const params = useParams();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Filter (${data.length})`}
          desc="Manage filters for your store"
        />
        <Button
          onClick={() => {
            router.push(`/${params.storeId}/filters/new`);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
      <Heading title="API" desc="API calls for Filters" />
      <Separator />
      <ApiList entityName="filters" entityIdName="filterId" />
    </>
  );
};

export default FiltersClient;
