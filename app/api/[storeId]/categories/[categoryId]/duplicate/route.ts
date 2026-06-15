import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
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

    const category = await prismadb.category.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    if (!category) {
      return new NextResponse("Category not found", { status: 404 });
    }

    const newCategory = await prismadb.category.create({
      data: {
        name: `${category.name} (copy)`,
        billboardId: category.billboardId,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(newCategory);
  } catch (error) {
    console.log("[CATEGORY_DUPLICATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
