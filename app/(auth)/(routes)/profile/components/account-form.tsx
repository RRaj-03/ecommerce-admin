"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import ImageUpload from "@/components/ui/imageUpload";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { AccountFormValues, accountFormSchema } from "@/Schema/userSchema";

// This can come from your database or API.
const defaultValues: Partial<AccountFormValues> = {
	firstName: "",
	lastName: "",
	email: "",
	image: { url: "" },
};

export function AccountForm({
	user,
}: {
	user: Partial<AccountFormValues & { id: string }>;
}) {
	const [loading, setLoading] = useState(false);
	const form = useForm<AccountFormValues>({
		resolver: zodResolver(accountFormSchema),
		defaultValues: user || defaultValues,
	});

	async function onSubmit(data: AccountFormValues) {
		try {
			setLoading(true);
			const res = await axios.put("/api/user", {
				userId: user.id,
				firstName: data.firstName,
				lastName: data.lastName,
				email: data.email,
				image: data.image,
			});

			toast.success("Account updated successfully");
		} catch (error: any) {
			console.log("error", error);
			toast.error(error?.response?.data?.message);
		} finally {
			setLoading(false);
		}
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="firstName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>First Name</FormLabel>
							<FormControl>
								<Input placeholder="Your First Name" {...field} />
							</FormControl>
							<FormDescription>
								This is the name that will be displayed on your profile and in
								emails.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="lastName"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Last Name</FormLabel>
							<FormControl>
								<Input placeholder="Your Last Name" {...field} />
							</FormControl>
							<FormDescription>
								This is the name that will be displayed on your profile and in
								emails.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<Input placeholder="Your Email" {...field} disabled />
							</FormControl>
							<FormDescription>
								We will send account related emails to this address.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					name="image"
					control={form.control}
					render={({ field }) => {
						return (
							<FormItem>
								<FormLabel>Image:</FormLabel>
								<FormControl>
									<ImageUpload
										value={field.value ? [field.value.url] : []}
										disabled={loading}
										onChange={(url) => field.onChange({ url })}
										onRemove={() => field.onChange({ url: "" })}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						);
					}}
				/>
				<Button type="submit">Update account</Button>
			</form>
		</Form>
	);
}
