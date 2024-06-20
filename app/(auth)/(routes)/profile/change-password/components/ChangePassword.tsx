"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import toast from "react-hot-toast";
import { useState } from "react";
import axios from "axios";
import {
	changePasswordFormSchema,
	changePasswordFormValues,
} from "@/Schema/userSchema";

// This can come from your database or API.
const defaultValues: Partial<changePasswordFormValues> = {
	currentPassword: "",
	newPassword: "",
	confirmPassword: "",
};

export function ChangePassword({ userId }: { userId: string }) {
	const [loading, setLoading] = useState(false);
	const form = useForm<changePasswordFormValues>({
		resolver: zodResolver(changePasswordFormSchema),
		defaultValues: defaultValues,
	});

	function onSubmit(data: changePasswordFormValues) {
		setLoading(true);
		axios
			.post("/api/user/change-password", {
				...data,
				userId: userId,
			})
			.then(() => {
				toast.success("Password Updated");
				setLoading(false);
			})
			.catch((error) => {
				toast.error(error.response.data.message);
				setLoading(false);
			});
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
				<FormField
					control={form.control}
					name="currentPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Current Password</FormLabel>
							<FormControl>
								<Input
									placeholder="Your Current Password"
									type="password"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Enter your current password to confirm your changes.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="newPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>New Password</FormLabel>
							<FormControl>
								<Input
									placeholder="Your New Password"
									type="password"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Make sure it's at least 8 characters including a number and a
								special character.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="confirmPassword"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Confirm Password</FormLabel>
							<FormControl>
								<Input
									placeholder="Your Confirm Password"
									type="password"
									{...field}
								/>
							</FormControl>
							<FormDescription>
								Make sure it matches the new password.
							</FormDescription>
							<FormMessage />
						</FormItem>
					)}
				/>

				<Button type="submit">Update account</Button>
			</form>
		</Form>
	);
}
