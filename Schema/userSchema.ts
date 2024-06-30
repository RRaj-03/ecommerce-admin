import { z } from "zod";

export const changePasswordFormSchema = z
	.object({
		currentPassword: z
			.string()
			.min(8, {
				message: "Password must be at least 8 characters.",
			})
			.max(30, {
				message: "Password must not be longer than 30 characters.",
			}),
		newPassword: z
			.string()
			.min(8, {
				message: "New Password must be at least 8 characters.",
			})
			.max(30, {
				message: "New Password must not be longer than 30 characters.",
			}),
		confirmPassword: z.string(),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		path: ["confirmPassword"],
		message: "Passwords do not match.",
	});

export type changePasswordFormValues = z.infer<typeof changePasswordFormSchema>;
export const AddressFormSchema = z.object({
	name: z.string({ required_error: "Name is required." }),
	phoneNumber: z.string({ required_error: "Phone number is required." }),
	line1: z.string().min(2, {
		message: "Address must be at least 2 characters.",
	}),
	line2: z.string().optional(),
	street: z.string({ required_error: "Street is required." }),
	city: z.string({
		required_error: "City is required.",
	}),
	state: z.string({
		required_error: "State is required.",
	}),
	country: z.string({
		required_error: "Country is required.",
	}),
	postalCode: z.string({
		required_error: "Postal code is required.",
	}),
});

export type AddressFormValues = z.infer<typeof AddressFormSchema>;

export const accountFormSchema = z.object({
	firstName: z
		.string()
		.min(2, {
			message: "Name must be at least 2 characters.",
		})
		.max(30, {
			message: "Name must not be longer than 30 characters.",
		}),
	lastName: z
		.string()
		.min(2, {
			message: "Name must be at least 2 characters.",
		})
		.max(30, {
			message: "Name must not be longer than 30 characters.",
		}),
	email: z.string().email({ message: "Invalid email address." }),
	image: z.object({ url: z.string() }),
});

export type AccountFormValues = z.infer<typeof accountFormSchema>;
