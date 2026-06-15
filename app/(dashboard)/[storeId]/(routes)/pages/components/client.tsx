"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React from "react";
import { PageColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import { ApiList } from "@/components/ui/apiList";

const PagesClient = ({ data }: { data: PageColumn[] }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Pages (${data.length})`}
          desc="Manage custom pages for your store (e.g. Privacy Policy, About Us)"
        />
        <Button onClick={() => router.push(`/${params.storeId}/pages/new`)}>
          <Plus className="h-4 w-4 mr-2" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable columns={columns} data={data} searchKey="title" />
      <Heading title="API" desc="API calls for Pages" />
      <Separator />
      <ApiList entityName="pages" entityIdName="pageId" />
    </>
  );
};
export default PagesClient;
