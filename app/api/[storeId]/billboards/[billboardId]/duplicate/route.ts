import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
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

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
    });

    if (!billboard) {
      return new NextResponse("Billboard not found", { status: 404 });
    }

    const newBillboard = await prismadb.billboard.create({
      data: {
        label: `${billboard.label} (copy)`,
        imageURL: billboard.imageURL,
        storeId: params.storeId,
      },
    });

    return NextResponse.json(newBillboard);
  } catch (error) {
    console.log("[BILLBOARD_DUPLICATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
