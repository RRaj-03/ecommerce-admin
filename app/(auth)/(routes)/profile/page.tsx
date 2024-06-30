import { Separator } from "@/components/ui/separator";
import { AccountForm } from "./components/account-form";
import { auth } from "@/actions/getAuth";
import prismadb from "@/lib/prismadb";

export default async function Profile() {
	const { userId } = await auth();
	const user = await prismadb.user.findUnique({
		where: { id: userId },

		select: {
			id: true,
			email: true,
			image: { select: { url: true } },
			firstName: true,
			lastName: true,
		},
	});
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Account</h3>
				<p className="text-sm text-muted-foreground">
					Update your account settings. Set your preferred language and
					timezone.
				</p>
			</div>
			<Separator />
			<AccountForm
				user={{ ...user, image: { url: user?.image ? user.image.url : "" } }}
			/>
		</div>
	);
}
