import prismadb from "@/lib/prismadb";
import React from "react";
import ProductForm from "../components/productForm";

const ProductPage = async ({
  params,
}: {
  params: { productId: string; storeId: string };
}) => {
  const product = await prismadb.product.findUnique({
    where: {
      id: params.productId,
    },
    include: {
      images: true,
      filterItems: true,
    },
  });
  const categories = await prismadb.category.findMany({
    where: {
      storeId: params.storeId,
    },
  });

  const filters = await prismadb.filter.findMany({
    where: {
      storeId: params.storeId,
    },
    include: {
      filterItems: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          initialData={product}
          categories={categories}

          filters={filters}
        />
      </div>
    </div>
  );
};

export default ProductPage;
