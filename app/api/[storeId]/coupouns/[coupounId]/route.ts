import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";

export async function GET(
	req: Request,
	{
		params,
	}: {
		params: {
			coupounId: string;
		};
	}
) {
	try {
		if (!params.coupounId) {
			return new NextResponse("CoupounId is required", { status: 400 });
		}

		const coupoun = await prismadb.coupouns.findUnique({
			where: {
				id: params.coupounId,
			},
		});
		return NextResponse.json(coupoun);
	} catch (error) {
		console.log("[Coupoun_get]", error);
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
			coupounId: string;
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
			archived,
			oneTime,
			fixed,
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
		if (archived === undefined) {
			return new NextResponse("Archived is Required", { status: 400 });
		}
		if (oneTime === undefined) {
			return new NextResponse("OneTime is Required", { status: 400 });
		}
		if (fixed === undefined) {
			return new NextResponse("Fixed is Required", { status: 400 });
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

		if (!params.coupounId) {
			return new NextResponse("CoupounId is required", { status: 400 });
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
		const coupoun = await prismadb.coupouns.updateMany({
			where: {
				id: params.coupounId,
			},
			data: {
				code,
				description,
				useBy,
				archived,
				oneTime,
				fixed,
				amount,
				percentage,
			},
		});
		return NextResponse.json(coupoun);
	} catch (error) {
		console.log("[Coupoun_PATCH]", error);
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
			coupounId: string;
		};
	}
) {
	try {
		const { userId } = await auth();

		if (!userId) {
			return new NextResponse("Unauthenticated", { status: 401 });
		}

		if (!params.coupounId) {
			return new NextResponse("CoupounId is required", { status: 400 });
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
		const coupoun = await prismadb.coupouns.update({
			where: {
				id: params.coupounId,
			},
			data: {
				archived: true,
			},
		});
		return NextResponse.json(coupoun);
	} catch (error) {
		console.log("[Coupoun_delete]", error);
		return new NextResponse("Internal Server error", { status: 500 });
	}
}
