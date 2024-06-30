import { AddressFormSchema } from "@/Schema/userSchema";
import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import { decode } from "next-auth/jwt";
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
		const result = AddressFormSchema.safeParse(body);
		if (result.success) {
			const {
				city,
				country,
				name,
				line1,
				phoneNumber,
				postalCode,
				state,
				street,
				line2 = "",
			} = result.data;
			const user = await prismadb.user.findUnique({
				where: { email: User.email! },
			});
			if (!user) {
				return NextResponse.json(
					{ message: "User not found" },
					{ status: 404 }
				);
			}
			await prismadb.address.create({
				data: {
					city,
					country,
					name,
					line1,
					phoneNumber,
					postalCode,
					state,
					street,
					line2,
					userId: user.id,
				},
			});
			return NextResponse.json(
				{ message: "Address Added Successfully" },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ message: "Invalid Data", errors: result.error },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.log("[error Address PUT]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}

export async function GET(req: NextRequest) {
	try {
		const token = req.headers.get("authorization")?.slice(7) || "";
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
		const user = await prismadb.user.findUnique({
			where: { email: User.email! },
			include: { address: true },
		});
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		return NextResponse.json({ address: user.address || [] }, { status: 200 });
	} catch (error) {
		// console.log("[error Address GET]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
