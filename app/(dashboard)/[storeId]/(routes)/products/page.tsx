import React from "react";
import ProductsClient from "./components/productsClient";
import prismadb from "@/lib/prismadb";
import { ProductColumn } from "./components/columns";
import { format } from "date-fns";
import { formatter } from "@/lib/utils";
const Products = async ({ params }: { params: { storeId: string } }) => {
  const products = await prismadb.product.findMany({
    where: { storeId: params.storeId },
    include: {
      category: true,
      color: true,
      size: true,
      filterItems: {
        include: {
          filterItem: {
            include: {
              filter: true,
            },
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    price: formatter.format(item.price.toNumber()),
    category: item.category.name,
    size: item.size.name,
    color: item.color.value,
    filterItemIds: item.filterItems.map((item) => ({
      label: item.filterItem.filter.name,
      value: item.filterItem.name,
    })),
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductsClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default Products;
