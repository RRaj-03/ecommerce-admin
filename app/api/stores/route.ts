import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { userId } = await auth();
		const body = await req.json();
		const { name } = body;

		if (!userId) {
			return new NextResponse("Unauthorized", { status: 401 });
		}

		if (!name) {
			return new NextResponse("Name is Required", { status: 400 });
		}

		const store = await prismadb.store.create({
			data: {
				name,
				userId,
			},
		});
		return NextResponse.json(store);
	} catch (error) {
		console.log("[Stores Error]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
