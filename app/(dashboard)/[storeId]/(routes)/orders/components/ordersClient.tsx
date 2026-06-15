"use client";
import { Button } from "@/components/ui/button";
import Heading from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Order } from "@/generated/prisma/client";
import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { OrderColumn, columns } from "./columns";
import { DataTable } from "@/components/ui/dataTable";
import { ApiList } from "@/components/ui/apiList";
import Image from "next/image";
import { formatter } from "@/lib/utils";

const OrdersClient = ({ data: initialData }: { data: OrderColumn[] }) => {
  const [isPaid, setIsPaid] = useState(true);
  const [data, setData] = useState<OrderColumn[]>(initialData);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    console.log("isPaid", isPaid);
    const newData = initialData.filter((item) => {
      console.log("item.isPaid", item.isPaid);
      return item.isPaid === isPaid;
    });
    setData(newData);
  }, [isPaid]);
  return (
    <>
      <Heading
        title={`Order (${data.length})`}
        desc="Manage orders for your store"
      />

      <Separator />
      <div className="overflow-x-hidden">
        <DataTable
          columns={columns}
          data={data}
          searchKey="products"
          setIsPaid={setIsPaid}
          isPaid={isPaid}
          renderSubComponent={({ row }) => {
            const orderItems = row.original.orderItemsRaw || [];
            return (
              <div className="p-4 pl-12">
                <h4 className="font-semibold mb-3">Order Breakdown</h4>
                <div className="grid grid-cols-1 gap-4 max-w-2xl">
                  {orderItems.map((item: any) => {
                    const product = item.product;
                    const imageUrl = product?.images?.[0]?.url || "";
                    const price = item.priceAtTime ? Number(item.priceAtTime) : Number(product?.price || 0);
                    return (
                      <div key={item.id} className="flex items-center gap-4 border p-3 rounded-md bg-white">
                        <div className="h-16 w-16 relative rounded overflow-hidden bg-gray-100 flex-shrink-0">
                          {imageUrl && (
                            <Image fill src={imageUrl} alt={product?.name || "Product"} className="object-cover" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product?.name}</p>
                          <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <div className="font-medium">
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
