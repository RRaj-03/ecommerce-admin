"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { CategoryColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import { ApiList } from "@/components/ui/apiList";

const CategoryClient = ({ data }: { data: CategoryColumn[] }) => {
  const router = useRouter();
  const params = useParams();
  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Categories (${data.length})`}
          desc="Manage Categories for your store"
        />
        <Button
          onClick={() => {
            router.push(`/${params.storeId}/categories/new`);
          }}
        >
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="name" />
      <Heading title="API" desc="API calls for Categories" />
      <Separator />
      <ApiList entityName="categories" entityIdName="categoryId" />
    </>
  );
};

export default CategoryClient;
