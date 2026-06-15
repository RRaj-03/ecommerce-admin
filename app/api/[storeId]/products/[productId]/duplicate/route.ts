import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        filterItems: true,
      },
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    const newProduct = await prismadb.product.create({
      data: {
        storeId: params.storeId,
        categoryId: product.categoryId,
        name: `${product.name} (copy)`,
        price: product.price,
        isFeatured: product.isFeatured,
        isArchived: product.isArchived,
        inventory: product.inventory,
        description: product.description,
        measurements: product.measurements,
        materialsAndCare: product.materialsAndCare,
        assembly: product.assembly,
        sku: product.sku ? `${product.sku}-copy` : null,
        slug: product.slug ? `${product.slug}-copy` : null,
        weight: product.weight,
        compareAtPrice: product.compareAtPrice,
        tags: product.tags,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        images: {
          createMany: {
            data: product.images.map((image) => ({
              url: image.url,
              storeId: params.storeId,
            })),
          },
        },
        filterItems: {
          createMany: {
            data: product.filterItems.map((fi) => ({
              filterItemId: fi.filterItemId,
            })),
          },
        },
      },
    });

    return NextResponse.json(newProduct);
  } catch (error) {
    console.log("[PRODUCT_DUPLICATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
