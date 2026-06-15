import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: {
      slug: string;
      storeId: string;
    };
  }
) {
  try {
    if (!params.slug) {
      return new NextResponse("Slug is required", { status: 400 });
    }

    const page = await prismadb.page.findUnique({
      where: {
        storeId_slug: {
          storeId: params.storeId,
          slug: params.slug,
        },
      },
    });

    if (!page || !page.isPublished) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return NextResponse.json(page);
  } catch (error) {
    console.log("[PAGE_SLUG_GET]", error);
    return new NextResponse("Internal Server error", { status: 500 });
  }
}
