import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; filterId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.filterId) {
      return new NextResponse("Filter id is required", { status: 400 });
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

    const filter = await prismadb.filter.findUnique({
      where: {
        id: params.filterId,
      },
    });

    if (!filter) {
      return new NextResponse("Filter not found", { status: 404 });
    }

    const newFilter = await prismadb.filter.create({
      data: {
        name: `${filter.name} (copy)`,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(newFilter);
  } catch (error) {
    console.log("[FILTER_DUPLICATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
