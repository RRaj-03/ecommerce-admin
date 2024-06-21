import { auth } from "@/actions/getAuth";
import { changePasswordFormSchema } from "@/Schema/userSchema";
import prismadb from "@/lib/prismadb";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
export async function POST(req: NextRequest) {
	try {
		const { userId } = await auth();
		if (!userId)
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		const body = await req.json();
		if (userId !== body.userId) {
			return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
		}
		const result = changePasswordFormSchema.safeParse(body);
		if (result.success) {
			const { confirmPassword, currentPassword, newPassword } = result.data;
			const user = await prismadb.user.findUnique({
				where: { id: userId },
			});
			if (!user) {
				return NextResponse.json(
					{ message: "User not found" },
					{ status: 404 }
				);
			}
			if (bcrypt.compareSync(currentPassword, user.password)) {
				await prismadb.user.update({
					where: { id: userId },
					data: {
						password: bcrypt.hashSync(confirmPassword, 10),
					},
				});
			}
			return NextResponse.json(
				{ message: "Password Updated" },
				{ status: 200 }
			);
		} else {
			return NextResponse.json(
				{ message: "Invalid Data", errors: result.error },
				{ status: 400 }
			);
		}
	} catch (error) {
		console.log("[error Change Password]", error);
		return NextResponse.json(
			{ message: "Internal Server Error", error },
			{ status: 500 }
		);
	}
}
