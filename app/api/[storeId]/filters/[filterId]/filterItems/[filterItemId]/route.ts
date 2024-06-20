import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: {
			filterItemId: string;
		};
	}
) {
	try {
		if (!params.filterItemId) {
			return new NextResponse("FilterItemId is required", { status: 400 });
		}

		const filterItem = await prismadb.filterItem.findUnique({
			where: {
				id: params.filterItemId,
			},
		});
		return NextResponse.json(filterItem);
	} catch (error) {
		console.log("[FilterItem_get]", error);
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
			filterId: string;
			filterItemId: string;
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
			return new NextResponse("Name is required", { status: 400 });
		}
		if (!value) {
			return new NextResponse("Value is required", { status: 400 });
		}
		if (!params.filterItemId) {
			return new NextResponse("FilterItemId is required", { status: 400 });
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
		const filterItem = await prismadb.filterItem.updateMany({
			where: {
				id: params.filterItemId,
				storeId: params.storeId,
				filterId: params.filterId,
			},
			data: {
				name,
				value,
			},
		});
		return NextResponse.json(filterItem);
	} catch (error) {
		console.log("[FilterItem_PATCH]", error);
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
			filterId: string;
			filterItemId: string;
		};
	}
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}

		if (!params.filterItemId) {
			return new NextResponse("FilterItemId is required", { status: 400 });
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
		const filterItem = await prismadb.filterItem.deleteMany({
			where: {
				id: params.filterItemId,
				filterId: params.filterId,
				storeId: params.storeId,
			},
		});
		return NextResponse.json(filterItem);
	} catch (error) {
		console.log("[FilterItem_delete]", error);
		return new NextResponse("Internal Server error", { status: 500 });
	}
}
