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
    const { label, imageURL } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!label) {
      return new NextResponse("Label is Required", { status: 400 });
    }
    if (!imageURL) {
      return new NextResponse("ImageUrl is Required", { status: 400 });
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
    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageURL,
        storeId: params.storeId,
      },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[Billboards POST Error]", error);
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

    const billboard = await prismadb.billboard.findMany({
      where: {
        storeId: params.storeId,
      },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[Billboards GET Error]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
