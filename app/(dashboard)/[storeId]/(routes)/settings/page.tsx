import prismadb from "@/lib/prismadb";
import { auth } from "@/actions/getAuth";
import { redirect } from "next/navigation";
import React from "react";
import SettingsForm from "./components/settings";

const SettingsPage = async ({
	params,
}: {
	params: {
		storeId: string;
	};
}) => {
	const { userId } = await auth();
	if (!userId) {
		redirect("/auth");
	}
	const store = await prismadb.store.findFirst({
		where: {
			id: params.storeId,
			userId,
		},
		include: {
			images: true,
		},
	});
	if (!store) {
		redirect("/");
	}

	return (
		<div className="flex flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<SettingsForm initialData={store} />
			</div>
		</div>
	);
};

export default SettingsPage;
