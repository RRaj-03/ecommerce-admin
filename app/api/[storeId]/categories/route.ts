import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
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
		const body = await req.json();
		const { userId } = await auth();
		const { name, billboardId } = body;

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}

		if (!name) {
			return new NextResponse("Name is Required", { status: 400 });
		}
		if (!billboardId) {
			return new NextResponse("BillboardId is Required", { status: 400 });
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
		const category = await prismadb.category.create({
			data: {
				name,
				billboardId,
				storeId: params.storeId,
			},
		});
		return NextResponse.json(category);
	} catch (error) {
		console.log("[Categories POST Error]", error);
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

		const category = await prismadb.category.findMany({
			where: {
				storeId: params.storeId,
			},
		});
		return NextResponse.json(category);
	} catch (error) {
		console.log("[Categories GET Error]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
