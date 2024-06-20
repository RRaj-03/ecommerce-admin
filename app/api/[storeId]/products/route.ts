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
		const { userId } = await auth();
		const body = await req.json();
		const {
			name,
			price,
			categoryId,
			sizeId,
			colorId,
			images,
			isFeatured,
			isArchived,
			filterItemIds,
		} = body;

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}

		if (!name) {
			return new NextResponse("Name is Required", { status: 400 });
		}
		if (!price) {
			return new NextResponse("Price is Required", { status: 400 });
		}
		if (!categoryId) {
			return new NextResponse("Category id is Required", { status: 400 });
		}
		if (!colorId) {
			return new NextResponse("Color id is Required", { status: 400 });
		}
		if (!sizeId) {
			return new NextResponse("Size id is Required", { status: 400 });
		}
		if (!images || !images.length) {
			return new NextResponse("Images are Required", { status: 400 });
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

		const filterCreate = filterItemIds.map((id: string) => ({
			filterItem: {
				connect: {
					id: id,
				},
			},
		}));
		console.log("filterCreate", filterCreate);
		const product = await prismadb.product.create({
			data: {
				name,
				price,
				categoryId,
				sizeId,
				colorId,
				isArchived,
				isFeatured,
				storeId: params.storeId,
				filterItems: {
					create: filterCreate,
				},
				images: {
					createMany: {
						data: [...images.map((image: { url: string }) => image)],
					},
				},
			},
		});
		return NextResponse.json(product);
	} catch (error) {
		console.log("[Products POST Error]", error);
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
		const { searchParams } = new URL(req.url);
		const categoryId = searchParams.get("categoryId") || undefined;
		const sizeId = searchParams.get("sizeId") || undefined;
		const colorId = searchParams.get("colorId") || undefined;
		const isFeatured = searchParams.get("isFeatured");

		if (!params.storeId) {
			return new NextResponse("StoreId is Required", { status: 400 });
		}

		const product = await prismadb.product.findMany({
			where: {
				storeId: params.storeId,
				categoryId,
				colorId,
				sizeId,
				isFeatured: isFeatured ? true : undefined,
				isArchived: false,
			},
			include: {
				images: true,
				color: true,
				size: true,
				category: true,
				filterItems: {
					include: {
						filterItem: {
							include: {
								filter: true,
							},
						},
					},
				},
			},
			orderBy: {
				createdAt: "desc",
			},
		});
		return NextResponse.json(product);
	} catch (error) {
		console.log("[Products GET Error]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
