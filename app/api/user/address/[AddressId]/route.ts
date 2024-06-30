import { AddressFormSchema } from "@/Schema/userSchema";
import prismadb from "@/lib/prismadb";
import { decode } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
	req: NextRequest,
	{
		params,
	}: {
		params: {
			AddressId: string;
		};
	}
) {
	try {
		const body = await req.json();
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
		const result = AddressFormSchema.safeParse(body);
		const { AddressId } = params;
		if (result.success) {
			const user = await prismadb.user.findUnique({
				where: { email: User.email! },
			});
			if (!user) {
				return NextResponse.json(
					{ message: "User not found" },
					{ status: 404 }
				);
			}
			const address = await prismadb.address.findUnique({
				where: { id: AddressId },
			});
			if (!address) {
				return NextResponse.json(
					{ message: "Address not found" },
					{ status: 404 }
				);
			}
			await prismadb.address.update({
				where: { id: AddressId },
				data: {
					...result.data,
				},
			});
			return NextResponse.json(
				{ message: "Address Updated Successfully" },
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

export async function DELETE(
	req: NextRequest,
	{ params }: { params: { AddressId: string } }
) {
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

		const { AddressId: id } = params;
		const user = await prismadb.user.findUnique({
			where: { email: User.email! },
		});
		if (!user) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		const address = await prismadb.address.findUnique({
			where: { id },
		});
		if (!address) {
			return NextResponse.json(
				{ message: "Address not found" },
				{ status: 404 }
			);
		}
		await prismadb.address.delete({
			where: { id },
		});
		return NextResponse.json(
			{ message: "Address Deleted Successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.log("[error Address DELETE]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}

export async function GET(
	req: NextRequest,
	{ params }: { params: { AddressId: string } }
) {
	try {
		const token = req.headers.get("authorization")?.slice(7) || "";
		if (token === "") {
			return NextResponse.json(
				{ message: "Token is required" },
				{ status: 400 }
			);
		}
		const { AddressId } = params;
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
		const Address = await prismadb.address.findUnique({
			where: { id: AddressId },
		});
		if (!Address) {
			return NextResponse.json({ message: "User not found" }, { status: 404 });
		}
		return NextResponse.json({ address: Address || [] }, { status: 200 });
	} catch (error) {
		console.log("[error Address GET]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
