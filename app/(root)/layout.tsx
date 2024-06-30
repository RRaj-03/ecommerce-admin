import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { redirect } from "next/navigation";
import React from "react";

const SetupLayout = async ({ children }: { children: React.ReactNode }) => {
	const { userId } = await await auth();

	if (!userId) {
		redirect("/auth");
	}
	const store = await prismadb.store.findFirst({
		where: { userId },
	});
	if (store) {
		redirect(`/${store.id}`);
	}
	return <>{children}</>;
};

export default SetupLayout;
