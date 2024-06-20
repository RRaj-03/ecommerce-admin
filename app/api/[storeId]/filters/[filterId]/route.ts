import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: {
			filterId: string;
			storeId: string;
		};
	}
) {
	try {
		if (!params.filterId) {
			return new NextResponse("FilterId is required", { status: 400 });
		}

		const filter = await prismadb.filter.findUnique({
			where: {
				id: params.filterId,
				storeId: params.storeId,
			},
			include: {
				filterItems: true,
			},
		});
		return NextResponse.json(filter);
	} catch (error) {
		console.log("[Filter_get]", error);
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
		if (!params.filterId) {
			return new NextResponse("FilterId is required", { status: 400 });
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
		const filter = await prismadb.filter.updateMany({
			where: {
				id: params.filterId,
				storeId: params.storeId,
			},
			data: {
				name,
			},
		});
		return NextResponse.json(filter);
	} catch (error) {
		console.log("[Filter_PATCH]", error);
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
		};
	}
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}

		if (!params.filterId) {
			return new NextResponse("FilterId is required", { status: 400 });
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
		const filter = await prismadb.filter.deleteMany({
			where: {
				id: params.filterId,
				storeId: params.storeId,
			},
		});
		return NextResponse.json(filter);
	} catch (error) {
		console.log("[Filter_delete]", error);
		return new NextResponse("Internal Server error", { status: 500 });
	}
}
