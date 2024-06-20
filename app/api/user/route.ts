import { auth } from "@/actions/getAuth";
import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	// This is a POST request

	try {
	} catch (error) {
		console.log("error [user Post]:", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}

export async function PUT(req: NextRequest) {
	// This is a PUT request
	try {
		const { userId } = await auth();
		if (!userId)
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		const body = await req.json();
		if (userId !== body.userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const { userId: userID = "", ...data } = body;

		const updatedUser = await prismadb.user.update({
			where: { id: userID },
			data: {
				...data,
				image: {
					update: {
						url: body?.image?.url || "",
					},
				},
			},
		});
		return NextResponse.json(
			{ message: "User Updated", updatedUser },
			{ status: 200 }
		);
	} catch (error) {
		console.log("error [user Put]:", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
