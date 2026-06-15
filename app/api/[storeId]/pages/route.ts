import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
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
    const { userId } = await auth();
    const body = await req.json();
    const { title, slug, content, isPublished } = body;
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }
    if (!title || !slug || !content) {
      return new NextResponse("Title, slug, and content are required", { status: 400 });
    }
    if (!params.storeId) {
      return new NextResponse("StoreId is required", { status: 400 });
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
    const page = await prismadb.page.create({
      data: {
        title,
        slug,
        content,
        isPublished: isPublished ?? true,
        storeId: params.storeId,
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGES_POST]", error);
    return new NextResponse("Internal Server error", { status: 500 });
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
      return new NextResponse("StoreId is required", { status: 400 });
    }
    const pages = await prismadb.page.findMany({
      where: {
        storeId: params.storeId,
      },
    });
    return NextResponse.json(pages);
  } catch (error) {
    console.log("[PAGES_GET]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}
