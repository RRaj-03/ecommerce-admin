import { auth } from "@/actions/getAuth";
import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId)
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		const body = await req.json();
		if (userId !== body.userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const { userId: userID = "", theme } = body;
		if (!theme) {
			return NextResponse.json(
				{ message: "Theme is required" },
				{ status: 400 }
			);
		}
		const updatedUser = await prismadb.user.update({
			where: { id: userID },
			data: { theme },
		});
		return NextResponse.json({ message: "Theme Updated" }, { status: 200 });
	} catch (error) {
		console.log("error [user appearance Post]:", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
