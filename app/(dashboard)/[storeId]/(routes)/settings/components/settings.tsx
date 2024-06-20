"use client";
import AlertModal from "@/components/modals/alertModal";
import { ApiAlert } from "@/components/ui/apiAlert";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/heading";
import ImageUpload from "@/components/ui/imageUpload";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useOrigin } from "@/hooks/useOrigin";
import { zodResolver } from "@hookform/resolvers/zod";
import { Image, Store } from "@prisma/client";
import axios from "axios";
import { Trash2 } from "lucide-react";
import { signOut } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
interface SettingsFormProps {
	initialData:
		| (Store & {
				images: Image[];
		  })
		| null;
}

const FormSchema = z.object({
	name: z.string().min(1),
	emailAddress: z.string().min(1),
	phoneNumber: z.string().min(1),
	Address: z.string().min(1),
	images: z.object({ url: z.string() }).array(),
});
type SettingsFormValues = z.infer<typeof FormSchema>;
const SettingsForm = ({ initialData }: SettingsFormProps) => {
	const origin = useOrigin();
	const router = useRouter();
	const params = useParams();
	const form = useForm<SettingsFormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: initialData
			? {
					...initialData,
					emailAddress: initialData.emailAddress!,
					phoneNumber: initialData.phoneNumber!,
					Address: initialData.Address!,
			  }
			: {
					name: "",
					images: [],
					emailAddress: "",
					phoneNumber: "",
					Address: "",
			  },
	});
	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const onSubmit = async (data: SettingsFormValues) => {
		try {
			setLoading(true);
			await axios.patch(`/api/stores/${params.storeId}`, data);
			router.refresh();
			toast.success("Store Updated");
		} catch (error) {
			toast.error("Something Went Wrong");
		} finally {
			setLoading(false);
		}
	};
	const onDelete = async () => {
		try {
			setLoading(true);
			await axios.delete(`/api/stores/${params.storeId}`);
			router.refresh();
			router.push("/");
			toast.success("Store deleted.");
		} catch (error) {
			toast.error("Make sure you removed all products and categories first");
		} finally {
			setOpen(false);
			setLoading(false);
		}
	};
	return (
		<>
			<AlertModal
				isOpen={open}
				onClose={() => setOpen(false)}
				onConfirm={() => {}}
				loading={loading}
			/>
			<div className="flex items-center justify-between">
				<Heading title="Settings" desc="Manage store preferences" />
				<Button
					variant={"destructive"}
					size={"icon"}
					disabled={loading}
					onClick={() => {
						onDelete();
					}}
				>
					<Trash2 className="h-4 w-4" />
				</Button>
			</div>
			<Separator />
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 w-full"
				>
					<FormField
						name="images"
						control={form.control}
						render={({ field }) => {
							return (
								<FormItem>
									<FormLabel>Images:</FormLabel>
									<FormControl>
										<ImageUpload
											value={field.value.map((image) => image.url)}
											disabled={loading}
											onChange={(url) =>
												field.onChange([...field.value, { url }])
											}
											onRemove={(url) =>
												field.onChange([
													...field.value.filter((image) => image.url !== url),
												])
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							);
						}}
					/>
					<div className="grid grid-cols-3 gap-8">
						<FormField
							name="name"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Name:</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												placeholder="Store Name"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							name="emailAddress"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Email:</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												placeholder="Store Email"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							name="phoneNumber"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Phone:</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												placeholder="Store Phone"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							name="Address"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Address:</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												placeholder="Store Address"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					</div>
					<Button disabled={loading} type="submit" className="ml-auto">
						Save Changes
					</Button>
				</form>
			</Form>
			<Separator />
			<ApiAlert
				title="NEXT_PUBLIC_API_URL"
				desc={`${origin}/stores/${params.storeId}`}
				variant="public"
			/>
		</>
	);
};

export default SettingsForm;
