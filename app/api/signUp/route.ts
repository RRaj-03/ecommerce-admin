import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import bycrpt from "bcryptjs";
export async function POST(req: Request) {
	try {
		const body = await req.json();
		const {
			email,
			password,
			firstName,
			lastName,
			isOwner = false,
			image = "",
		} = body;

		if (firstName === "") {
			return NextResponse.json(
				{ message: "First Name is Required" },
				{ status: 400 }
			);
		}
		if (lastName === "") {
			return NextResponse.json(
				{ message: "Last Name is Required" },
				{ status: 400 }
			);
		}
		if (password === "") {
			return NextResponse.json(
				{ message: "Password is Required" },
				{ status: 400 }
			);
		}
		if (password.length < 8) {
			return NextResponse.json(
				{ message: "Password must be at least 8 characters" },
				{ status: 400 }
			);
		}

		const user = await prismadb.user.findUnique({
			where: {
				email,
			},
		});

		if (user) {
			return NextResponse.json(
				{ message: "User already exists" },
				{ status: 400 }
			);
		}

		const newUser = await prismadb.user.create({
			data: {
				email,
				firstName,
				lastName,
				password: bycrpt.hashSync(password, 10),
				isOwner,
				image: {
					create: {
						url: image,
					},
				},
			},
			select: {
				id: true,
				email: true,
				firstName: true,
				lastName: true,
			},
		});

		return NextResponse.json(
			{
				message: "User created Successfully. SignIn to Get Started",
				data: newUser,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.log("[SignUp Error]", error);
		return new Response("Internal Error", { status: 500 });
	}
}
