import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";

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

		const store = await prismadb.store.findUnique({
			where: {
				id: params.storeId,
			},
			include: {
				images: true,
			},
		});
		return NextResponse.json(store);
	} catch (error) {
		console.log("[Store_get]", error);
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
		};
	}
) {
	try {
		const { userId } = await auth();
		const body = await req.json();
		const { name, images, emailAddress, phoneNumber, Address } = body;
		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}
		if (!name) {
			return new NextResponse("Name is required", { status: 400 });
		}
		if (!images || !images.length) {
			return new NextResponse("Images are Required", { status: 400 });
		}
		if (!params.storeId) {
			return new NextResponse("StoreId is required", { status: 400 });
		}
		await prismadb.store.update({
			where: {
				id: params.storeId,
				userId,
			},
			data: {
				name,
				emailAddress,
				phoneNumber,
				Address,
				images: {
					deleteMany: {},
				},
			},
		});
		const store = await prismadb.store.update({
			where: {
				id: params.storeId,
				userId,
			},
			data: {
				images: {
					createMany: {
						data: [...images.map((image: { url: string }) => image)],
					},
				},
			},
		});
		return NextResponse.json(store);
	} catch (error) {
		console.log("[Store_PATCH]", error);
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
		};
	}
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}

		if (!params.storeId) {
			return new NextResponse("StoreId is required", { status: 400 });
		}
		const store = await prismadb.store.deleteMany({
			where: {
				id: params.storeId,
				userId,
			},
		});
		return NextResponse.json(store);
	} catch (error) {
		console.log("[Store_PATCH]", error);
		return new NextResponse("Internal Server error", { status: 500 });
	}
}
