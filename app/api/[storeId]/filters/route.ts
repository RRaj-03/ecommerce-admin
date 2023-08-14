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
    const { name } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is Required", { status: 400 });
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
    const filter = await prismadb.filter.create({
      data: {
        name,
        storeId: params.storeId,
        filterItems: {
          create: {
            name: "None",
            value: "null",
            storeId: params.storeId,
          },
        },
      },
    });
    return NextResponse.json(filter);
  } catch (error) {
    console.log("[Filters POST Error]", error);
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
    if (!params.storeId) {
      return new NextResponse("StoreId is Required", { status: 400 });
    }
    const filter = await prismadb.filter.findMany({
      where: {
        storeId: params.storeId,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        filterItems: true,
      },
    });
    return NextResponse.json(filter);
  } catch (error) {
    console.log("[Filters GET Error]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
