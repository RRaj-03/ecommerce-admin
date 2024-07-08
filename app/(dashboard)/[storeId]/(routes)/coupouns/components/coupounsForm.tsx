"use client";
import AlertModal from "@/components/modals/alertModal";
import { ApiAlert } from "@/components/ui/apiAlert";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import Heading from "@/components/ui/heading";
import ImageUpload from "@/components/ui/imageUpload";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useOrigin } from "@/hooks/useOrigin";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Coupouns, Store } from "@prisma/client";
import axios from "axios";
import { format, add } from "date-fns";
import { CalendarIcon, Trash2 } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import * as z from "zod";
interface CoupounFormProps {
	initialData: Coupouns | null;
}

const FormSchema = z.object({
	description: z.string(),
	fixed: z.boolean(),
	amount: z.coerce.number().optional(),
	percentage: z.coerce.number().optional(),
	useBy: z.date(),
	oneTime: z.boolean(),
	code: z.string(),
	archived: z.boolean(),
});
type CoupounFormValues = z.infer<typeof FormSchema>;
const CoupounForm = ({ initialData }: CoupounFormProps) => {
	const origin = useOrigin();
	const router = useRouter();
	const params = useParams();
	const title = initialData ? "Edit coupoun" : "Create coupoun";
	const description = initialData ? "Edit a coupoun" : "Add a new coupoun";
	const toastMessage = initialData ? "Coupoun Updated" : "Coupoun Created";
	const action = initialData ? "Save changes" : "Create";

	const form = useForm<CoupounFormValues>({
		resolver: zodResolver(FormSchema),
		defaultValues: initialData
			? {
					...initialData,
					amount: parseFloat(String(initialData?.amount)) || undefined,
					percentage: parseFloat(String(initialData?.percentage)) || undefined,
			  }
			: {
					description: "",
					fixed: true,
					amount: 0,
					percentage: 0,
					useBy: add(new Date(), { days: 1 }),
					oneTime: true,
					code: "",
					archived: false,
			  },
	});

	const [open, setOpen] = useState(false);
	const [loading, setLoading] = useState(false);
	const onSubmit = async (data: CoupounFormValues) => {
		try {
			setLoading(true);
			if (initialData) {
				await axios.patch(
					`/api/${params.storeId}/coupouns/${params.coupounId}`,
					data
				);
			} else {
				await axios.post(`/api/${params.storeId}/coupouns`, data);
			}
			router.refresh();
			router.push(`/${params.storeId}/coupouns`);
			toast.success(toastMessage);
		} catch (error) {
			console.log("error", error);
			toast.error("Something Went Wrong");
		} finally {
			setLoading(false);
		}
	};
	const onDelete = async () => {
		try {
			setLoading(true);
			await axios.delete(`/api/${params.storeId}/coupouns/${params.coupounId}`);
			router.refresh();
			router.push(`/${params.storeId}/coupouns`);
			toast.success("Coupoun deleted.");
		} catch (error) {
			toast.error(
				"Some error occured while archiving the coupoun. Please try again later."
			);
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
				<Heading title={title} desc={description} />
				{initialData && (
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
				)}
			</div>
			<Separator />
			<Form {...form}>
				<form
					onSubmit={form.handleSubmit(onSubmit)}
					className="space-y-8 w-full"
				>
					<div className="grid grid-cols-3 gap-8">
						<FormField
							name="code"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Coupoun Code:</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												placeholder="Coupoun Code"
												{...field}
												onChange={(e) => {
													field.onChange(e.target.value.toUpperCase());
												}}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							name="description"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Coupoun Description:</FormLabel>
										<FormControl>
											<Input
												disabled={loading}
												placeholder="Coupoun Description"
												{...field}
											/>
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							name="fixed"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Fixed Amount</FormLabel>
											<FormDescription>
												Discount is in Percentage or Fixed Amount
											</FormDescription>
										</div>
									</FormItem>
								);
							}}
						/>
						{form.getValues("fixed") === undefined ||
						form.getValues("fixed") ? (
							<FormField
								name="amount"
								control={form.control}
								render={({ field }) => {
									return (
										<FormItem>
											<FormLabel>Amount:</FormLabel>
											<FormControl>
												<Input
													disabled={loading}
													placeholder="Coupoun Amount"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						) : (
							<FormField
								name="percentage"
								control={form.control}
								render={({ field }) => {
									return (
										<FormItem>
											<FormLabel>Percentage:</FormLabel>
											<FormControl>
												<Input
													disabled={loading}
													placeholder="Coupoun Percentage"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									);
								}}
							/>
						)}
						<FormField
							name="useBy"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem>
										<FormLabel>Use Before:</FormLabel>
										<div>
											<FormControl>
												<Popover>
													<PopoverTrigger asChild>
														<Button
															variant={"outline"}
															className={cn(
																"w-full justify-start text-left font-normal",
																!form.getValues("useBy") &&
																	"text-muted-foreground"
															)}
														>
															<CalendarIcon className="mr-2 h-4 w-4" />
															{form.getValues("useBy") ? (
																format(form.getValues("useBy"), "PPP")
															) : (
																<span>Pick a Date</span>
															)}
														</Button>
													</PopoverTrigger>
													<PopoverContent className="w-auto p-0">
														<Calendar
															mode="single"
															selected={form.getValues("useBy")}
															onSelect={(value) =>
																form.setValue("useBy", value!)
															}
															fromDate={new Date()}
															initialFocus
														/>
													</PopoverContent>
												</Popover>
											</FormControl>
										</div>

										<FormMessage />
									</FormItem>
								);
							}}
						/>
						<FormField
							name="archived"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>Archived</FormLabel>
											<FormDescription>
												Archived coupouns will not be available for use
											</FormDescription>
										</div>
									</FormItem>
								);
							}}
						/>
						<FormField
							name="oneTime"
							control={form.control}
							render={({ field }) => {
								return (
									<FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md p-4 border">
										<FormControl>
											<Checkbox
												checked={field.value}
												onCheckedChange={field.onChange}
											/>
										</FormControl>
										<div className="space-y-1 leading-none">
											<FormLabel>One time </FormLabel>
											<FormDescription>
												Coupoun can be used only once
											</FormDescription>
										</div>
									</FormItem>
								);
							}}
						/>
					</div>
					<Button disabled={loading} type="submit" className="ml-auto">
						{action}
					</Button>
				</form>
			</Form>
		</>
	);
};

export default CoupounForm;
