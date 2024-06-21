import { auth } from "@/actions/getAuth";
import prismadb from "@/lib/prismadb";
import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
	try {
		const body = await req.json();
		const { token = "" } = body;
		if (token === "") {
			return NextResponse.json(
				{ message: "Token is required" },
				{ status: 400 }
			);
		}
		let User;
		try {
			User = await decode({
				token: token,
				secret: process.env.NEXTAUTH_SECRET!,
			});
		} catch (error) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		if (!User) {
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
			where: { email: User.email! },
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
