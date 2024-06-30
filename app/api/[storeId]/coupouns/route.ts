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
			code,
			description,
			useBy,
			archived = false,
			oneTime = false,
			fixed = true,
			amount,
			percentage,
		} = body;

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}
		if (!code) {
			return new NextResponse("Code is Required", { status: 400 });
		}
		if (!description) {
			return new NextResponse("Description is Required", { status: 400 });
		}
		if (!useBy) {
			return new NextResponse("UseBy is Required", { status: 400 });
		}
		if (fixed && !amount) {
			return new NextResponse("Amount is Required", { status: 400 });
		}
		if (!fixed && !percentage) {
			return new NextResponse("Percentage is Required", { status: 400 });
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
		const coupoun = await prismadb.coupouns.create({
			data: {
				code,
				description,
				useBy,
				archived,
				oneTime,
				fixed,
				amount,
				percentage,
				storeId: params.storeId,
			},
		});
		return NextResponse.json(coupoun);
	} catch (error) {
		console.log("[Coupouns POST Error]", error);
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

		const coupoun = await prismadb.coupouns.findMany({
			where: {
				storeId: params.storeId,
			},
		});
		return NextResponse.json(coupoun);
	} catch (error) {
		console.log("[Coupouns GET Error]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
