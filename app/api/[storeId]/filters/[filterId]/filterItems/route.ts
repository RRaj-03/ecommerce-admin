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
			filterId: string;
		};
	}
) {
	try {
		const { userId } = await auth();
		const body = await req.json();
		const { name, value } = body;

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}

		if (!name) {
			return new NextResponse("Name is Required", { status: 400 });
		}
		if (!value) {
			return new NextResponse("Value is Required", { status: 400 });
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
		const filter = await prismadb.filterItem.create({
			data: {
				name,
				value,
				storeId: params.storeId,
				filterId: params.filterId,
			},
		});
		return NextResponse.json(filter);
	} catch (error) {
		console.log("[FilterItems POST Error]", error);
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
			filterId: string;
		};
	}
) {
	try {
		if (!params.storeId) {
			return new NextResponse("StoreId is Required", { status: 400 });
		}

		const filters = await prismadb.filterItem.findMany({
			where: {
				storeId: params.storeId,
				filterId: params.filterId,
			},
		});
		return NextResponse.json(filters);
	} catch (error) {
		console.log("[FilterItems GET Error]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
