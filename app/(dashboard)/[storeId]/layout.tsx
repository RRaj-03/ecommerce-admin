import { redirect } from "next/navigation";
import { auth } from "@/actions/getAuth";

import Navbar from "@/components/navbar";
import prismadb from "@/lib/prismadb";

export default async function DashboardLayout({
	children,
	params,
}: {
	children: React.ReactNode;
	params: { storeId: string };
}) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/auth");
	}

	const store = await prismadb.store.findFirst({
		where: {
			id: params.storeId,
			userId,
		},
	});

	if (!store) {
		redirect("/");
	}

	return (
		<>
			<Navbar />
			{children}
		</>
	);
}
