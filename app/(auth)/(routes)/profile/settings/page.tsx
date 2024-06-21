import { Separator } from "@/components/ui/separator";
import { AppearanceForm } from "./components/AppearenceForm";
import { auth } from "@/actions/getAuth";

export default async function SettingsPage() {
	const { userId } = await auth();
	return (
		<div className="space-y-6">
			<div>
				<h3 className="text-lg font-medium">Appearance</h3>
				<p className="text-sm text-muted-foreground">
					Customize the appearance of the app. Automatically switch between day
					and night themes.
				</p>
			</div>
			<Separator />
			<AppearanceForm userId={userId!} />
		</div>
	);
}
