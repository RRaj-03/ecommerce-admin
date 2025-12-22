import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export async function POST(
  req: Request,
  {
    params,
  }: {
    params: {
      storeId: string;
    };
  }
) {
  try {
    const { userId } = auth();
    const body = await req.json();
    const {
      name,
      price,
      categoryId,

      images,
      isFeatured,
      isArchived,
      filterItemIds,
      inventory,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is Required", { status: 400 });
    }
    if (!price) {
      return new NextResponse("Price is Required", { status: 400 });
    }
    if (!inventory) {
      return new NextResponse("Inventory is Required", { status: 400 });
    }
    if (!categoryId) {
      return new NextResponse("Category id is Required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are Required", { status: 400 });
    }
    if (!filterItemIds || !filterItemIds.length) {
      return new NextResponse("FilterItems are Required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("StoreId is Required", { status: 400 });
    }
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const filterCreate = filterItemIds.map((id: string) => ({
      filterItem: {
        connect: {
          id: id,
        },
      },
    }));
    console.log("filterCreate", filterCreate);
    const product = await prismadb.product.create({
      data: {
        name,
        price,
        categoryId,

        isArchived,
        isFeatured,
        inventory,
        storeId: params.storeId,
        filterItems: {
          create: filterCreate,
        },
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });
    return NextResponse.json(product);
  } catch (error) {
    console.log("[Products POST Error]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      storeId: string;
    };
  }
) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");

    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
    }

    const storeFilters = await prismadb.filter.findMany({
      where: {
        storeId: params.storeId,
      },
    });

    const filterConditions = storeFilters
      .map((filter) => {
        const value = searchParams.get(filter.id);
        if (value) {
          const selectedFilterItemIds = value.split(",");
          if (selectedFilterItemIds.length > 0) {
            return {
              filterItems: {
                some: {
                  filterItemId: {
                    in: selectedFilterItemIds,
                  },
                },
              },
            };
          }
        }
        return null;
      })
      .filter((condition) => condition !== null);

    const product = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        AND: [
          ...filterConditions,
        ],
      },
      include: {
        images: true,
        category: true,
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
    return NextResponse.json(product);
  } catch (error) {
    console.log("[Products GET Error]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
