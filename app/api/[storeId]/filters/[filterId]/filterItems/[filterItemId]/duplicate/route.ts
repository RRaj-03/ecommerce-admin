import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; filterId: string; filterItemId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.filterItemId) {
      return new NextResponse("Filter item id is required", { status: 400 });
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

    const filterItem = await prismadb.filterItem.findUnique({
      where: {
        id: params.filterItemId,
      },
    });

    if (!filterItem) {
      return new NextResponse("Filter Item not found", { status: 404 });
    }

    const newFilterItem = await prismadb.filterItem.create({
      data: {
        name: `${filterItem.name} (copy)`,
        value: filterItem.value,
        filterId: params.filterId,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(newFilterItem);
  } catch (error) {
    console.log("[FILTER_ITEM_DUPLICATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
