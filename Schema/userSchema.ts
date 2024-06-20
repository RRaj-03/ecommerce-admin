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
