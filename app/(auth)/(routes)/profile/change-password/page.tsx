import { Separator } from "@/components/ui/separator";
import { ChangePassword } from "./components/ChangePassword";
import { auth } from "@/actions/getAuth";

export default async function ChangePasswordPage() {
	const { userId } = await auth();
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Change Password</h3>
				<p className="text-sm text-muted-foreground">
					Change your account password. Make sure to use a strong password.
				</p>
			</div>
			<Separator />
			<ChangePassword userId={userId!} />
		</div>
	);
}
