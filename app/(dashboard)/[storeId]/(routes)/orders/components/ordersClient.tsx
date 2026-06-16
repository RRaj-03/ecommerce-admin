"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { OrderColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import Image from "next/image";
import { formatter } from "@/lib/utils";
import { AssignToolbar } from "./assignToolbar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface OrdersClientProps {
  data: OrderColumn[];
  assignableMembers: { id: string; name: string; roleName: string }[];
  canAssign: boolean;
  canUpdateStatus: boolean;
  activeTab?: string;
}

const OrdersClient = ({
  data: initialData,
  assignableMembers,
  canAssign,
  canUpdateStatus,
  activeTab = "all",
}: OrdersClientProps) => {
  const [isPaid, setIsPaid] = useState(true);
  const [data, setData] = useState<OrderColumn[]>(initialData);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    const newData = initialData.filter((item) => {
      return item.isPaid === isPaid;
    });
    setData(newData);
  }, [initialData, isPaid]);

  const onTabChange = (val: string) => {
    router.push(`/${params.storeId}/orders?tab=${val}`);
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Orders (${data.length})`}
          desc="Manage orders for your store"
        />
        {/* We can add filter tabs here if we want to show All / My Orders */}
        <Tabs value={activeTab} onValueChange={onTabChange} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="my_team">My Team</TabsTrigger>
            <TabsTrigger value="assigned_to_me">Assigned to Me</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <Separator className="my-4" />
      <div className="overflow-x-hidden">
        <DataTable
          columns={columns}
          data={data}
          searchKey="products"
          setIsPaid={setIsPaid}
          isPaid={isPaid}
          renderToolbar={(selectedRows, clearSelection) => (
            <AssignToolbar
              storeId={params.storeId as string}
              selectedOrderIds={selectedRows.map((r) => r.id)}
              assignableMembers={assignableMembers}
              canAssign={canAssign}
              canUpdateStatus={canUpdateStatus}
              onClearSelection={clearSelection}
            />
          )}
          renderSubComponent={({ row }) => {
            const orderItems = row.original.orderItemsRaw || [];
            return (
              <div className="p-4 pl-12 bg-slate-50/50">
                <h4 className="font-semibold mb-3">Order Breakdown</h4>
                <div className="grid grid-cols-1 gap-4 max-w-2xl">
                  {orderItems.map((item: any) => {
                    const product = item.product;
                    const imageUrl = product?.images?.[0]?.url || "";
                    const price = item.priceAtTime ? Number(item.priceAtTime) : Number(product?.price || 0);
                    return (
                      <div key={item.id} className="flex items-center gap-4 border p-3 rounded-md bg-white shadow-sm">
                        <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-100 flex-shrink-0 border">
                          {imageUrl && (
                            <Image fill src={imageUrl} alt={product?.name || "Product"} className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{product?.name}</p>
                          <p className="text-xs text-gray-500 mt-1">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-medium text-sm">
                          {formatter.format(price * (item.quantity || 1))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          }}
        />
      </div>
    </>
  );
};

export default OrdersClient;
