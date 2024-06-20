import { authConfig } from "@/auth.config";
import prismadb from "@/lib/prismadb";
import { ca } from "date-fns/locale";
import { getServerSession } from "next-auth";
import Email from "next-auth/providers/email";

export const auth = async () => {
	const session = await getServerSession(authConfig);
	try {
		if (!session) {
			return { userId: undefined, email: undefined };
		}
		const user = await prismadb.user.findUnique({
			where: { email: session.user!.email! },
			select: { id: true, email: true, isOwner: true },
		});
		if (!user) return { userId: undefined, email: undefined };
		return { userId: user.id, email: user.email, isOwner: user.isOwner };
	} catch (error) {
		return { userId: undefined, email: undefined };
	}
};
