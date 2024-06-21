import { auth } from "@/actions/getAuth";
import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	// This is a POST request

	try {
		const body = await req.json();
		if (!body?.email) {
			return NextResponse.json(
				{ message: "Email is required" },
				{ status: 400 }
			);
		}
		const user = await prismadb.user.findUnique({
			where: { email: body.email },
			include: { image: true },
		});
		return NextResponse.json({ user }, { status: 200 });
	} catch (error) {
		console.log("error [user POST]:", error);
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
		console.log("userId", userId, body.userId);
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
