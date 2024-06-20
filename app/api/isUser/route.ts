import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
	try {
		const { email } = await req.json();
		if (!email) {
			return new NextResponse("Email is required", { status: 400 });
		}
		const user = await prismadb.user.findUnique({
			where: {
				email,
			},
		});
		if (!user) {
			return NextResponse.json(
				{ code: 1, message: "User not found" },
				{ status: 200 }
			);
		}
		return NextResponse.json(
			{ code: 0, message: "User found" },
			{ status: 200 }
		);
	} catch (error) {
		console.log("[isUser Error]", error);
		return new NextResponse("Internal Error", { status: 500 });
	}
}
