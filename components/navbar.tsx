import { auth } from "@/actions/getAuth";
import React from "react";
import { MainNav } from "./mainNav";
import StoreSwitcher from "./storeSwitcher";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { ThemeToggle } from "./themeToggle";
import { Button } from "./ui/button";
import { signOut } from "next-auth/react";
import UserButton from "./userButton";

const Navbar = async () => {
	const { userId } = await auth();
	if (!userId) {
		redirect("/auth");
	}
	const store = await prismadb.store.findMany({
		where: { userId },
	});
	const user = await prismadb.user.findUnique({
		where: { id: userId },
		select: {
			id: true,
			email: true,
			firstName: true,
			lastName: true,
			image: {
				select: {
					url: true,
				},
			},
		},
	});
	return (
		<div className="border-b shadow-md">
			<div className="flex h-16 items-center px-4">
				<StoreSwitcher items={store} />
				<MainNav className="mx-6" />
				<div className="ml-auto flex items-center space-x-4">
					<ThemeToggle />
					{/* <UserButton afterSignOutUrl="/" /> */}
					<UserButton user={user!} />
				</div>
			</div>
		</div>
	);
};

export default Navbar;
