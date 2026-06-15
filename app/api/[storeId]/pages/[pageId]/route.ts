import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      pageId: string;
      storeId: string;
    };
  }
) {
  try {
    if (!params.pageId) {
      return new NextResponse("PageId is required", { status: 400 });
    }

    const page = await prismadb.page.findUnique({
      where: {
        id: params.pageId,
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGE_GET]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  {
    params,
  }: {
    params: {
      storeId: string;
      pageId: string;
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
    if (!params.pageId) {
      return new NextResponse("PageId is required", { status: 400 });
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
    const page = await prismadb.page.updateMany({
      where: {
        id: params.pageId,
        storeId: params.storeId,
      },
      data: {
        title,
        slug,
        content,
        isPublished,
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGE_PATCH]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  {
    params,
  }: {
    params: {
      storeId: string;
      pageId: string;
    };
  }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.pageId) {
      return new NextResponse("PageId is required", { status: 400 });
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
    const page = await prismadb.page.deleteMany({
      where: {
        id: params.pageId,
        storeId: params.storeId,
      },
    });
    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGE_DELETE]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}
