import { Metadata } from "next";
import Image from "next/image";

import { Separator } from "@/components/ui/separator";
import { SidebarNav } from "./components/sidebar-nav";
import Navbar from "@/components/navbar";
import { auth } from "@/actions/getAuth";
import { redirect } from "next/navigation";
import prismadb from "@/lib/prismadb";
import toast from "react-hot-toast";

export const metadata: Metadata = {
	title: "Forms",
	description: "Advanced form example using react-hook-form and Zod.",
};

const sidebarNavItems = [
	{
		title: "Profile",
		href: "/profile",
	},
	{
		title: "Change Password",
		href: "/profile/change-password",
	},
	{
		title: "Setting",
		href: "/profile/settings",
	},
];

interface SettingsLayoutProps {
	children: React.ReactNode;
}

export default async function SettingsLayout({
	children,
}: SettingsLayoutProps) {
	const { userId } = await auth();

	if (!userId) {
		redirect("/auth");
	}

	const store = await prismadb.store.findFirst({
		where: {
			userId,
		},
	});

	if (!store) {
		redirect("/");
	}
	return (
		<>
			<Navbar />
			<div className="md:hidden">
				<Image
					src="/examples/forms-light.png"
					width={1280}
					height={791}
					alt="Forms"
					className="block dark:hidden"
				/>
				<Image
					src="/examples/forms-dark.png"
					width={1280}
					height={791}
					alt="Forms"
					className="hidden dark:block"
				/>
			</div>
			<div className="hidden space-y-6 p-10 pb-16 md:block">
				<div className="space-y-0.5">
					<h2 className="text-2xl font-bold tracking-tight">Settings</h2>
					<p className="text-muted-foreground">
						Manage your account settings and set e-mail preferences.
					</p>
				</div>
				<Separator className="my-6" />
				<div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
					<aside className="-mx-4 lg:w-1/5 border-r-2">
						<SidebarNav items={sidebarNavItems} />
					</aside>
					<div className="flex-1 lg:max-w-2xl">{children}</div>
				</div>
			</div>
		</>
	);
}
