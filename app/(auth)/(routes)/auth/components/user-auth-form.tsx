"use client";

import { useState, HTMLAttributes, SyntheticEvent } from "react";

import { cn } from "@/lib/utils";
import { Icons } from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn as SocialSignIn } from "next-auth/react";
import axios from "axios";
import toast from "react-hot-toast";
import { revalidatePath } from "next/cache";
import { useSearchParams } from "next/navigation";

interface UserAuthFormProps extends HTMLAttributes<HTMLDivElement> {}

export default function UserAuthForm({
	className,
	...props
}: UserAuthFormProps) {
	const query = useSearchParams();
	const newUser = query?.get("newUser");
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [signUp, setSignUp] = useState<boolean>(newUser ? true : false);
	const [signIn, setSignIn] = useState<boolean>(false);
	const [email, setEmail] = useState<string>("");
	const [signUpData, setSignUpData] = useState<{
		firstName: string;
		lastName: string;
		password: string;
		cpassword: string;
	}>({ firstName: "", lastName: "", password: "", cpassword: "" });
	const [error, setError] = useState<{
		email: string;
		password: string;
		firstName: string;
		lastName: string;
		cpassword: string;
	}>({
		email: "",
		password: "",
		firstName: "Hello",
		lastName: "",
		cpassword: "",
	});
	async function onSubmit(event: SyntheticEvent) {
		event.preventDefault();
		setIsLoading(true);
		if (email === "") {
			setError((prev) => ({ ...prev, email: "Email is required" }));
			setSignUp(false);
			setSignIn(false);
			return;
		}
		try {
			const res = await axios.post("/api/isUser", {
				email: email,
			});
			const data = res.data;
			if (data.code === 0) {
				setSignIn(true);
				console.log("false");
			}
			if (data.code === 1) {
				setSignUp(true);
				console.log("true");
			}
		} catch (error: any) {
			console.log("error", error);
			toast.error(error.response.data.message);
		} finally {
			setIsLoading(false);
		}
	}
	async function onSignInSubmit(event: SyntheticEvent) {
		event.preventDefault();
		setIsLoading(true);
		if (signUpData.password === "") {
			setError((prev) => ({ ...prev, password: "Password is required" }));
			return;
		}
		try {
			console.log("new", signUpData.password);
			const res = await SocialSignIn("credentials", {
				email: email,
				password: signUpData.password,
				redirect: true,
				callbackUrl: "/",
			});
			console.log("res", res);
			// revalidatePath("/");
			if (res!.error) {
				toast.error(res!.error);
			}
		} catch (error: any) {
			console.log("error", error);
			toast.error(error.response.data.message);
		} finally {
			setIsLoading(false);
		}
	}
	async function onSignUpSubmit(event: SyntheticEvent) {
		event.preventDefault();
		setIsLoading(true);
		if (signUpData.firstName === "") {
			setError((prev) => ({ ...prev, firstName: "First Name is Required" }));
			return;
		}
		if (signUpData.lastName === "") {
			setError((prev) => ({ ...prev, lastName: "Last Name is Required" }));
			return;
		}
		if (signUpData.password === "") {
			setError((prev) => ({ ...prev, password: "Password is Required" }));
			return;
		}
		if (signUpData.password.length < 8) {
			setError((prev) => ({
				...prev,
				password: "Password must be greater than or equal to 8 character",
			}));
			return;
		}
		if (signUpData.cpassword === "") {
			setError((prev) => ({
				...prev,
				cpassword: "Current Password is Required",
			}));
			return;
		}
		if (signUpData.cpassword !== signUpData.password) {
			setError((prev) => ({
				...prev,
				cpassword: "Password and Current Password should be same",
			}));
			return;
		}
		try {
			const res = await axios.post("/api/signUp", {
				email: email,
				firstName: signUpData.firstName,
				lastName: signUpData.lastName,
				password: signUpData.password,
			});
			const data = res.data;
			if (data.code === 0) {
				setSignIn(true);
				console.log("false");
			}
			if (data.code === 1) {
				setSignUp(true);
				console.log("true");
			}
			console.log("signUp", signUp);
		} catch (error: any) {
			console.log("error", error);
			toast.error(error.response.data.message);
		} finally {
			setIsLoading(false);
		}
	}
	return (
		<div className={cn("grid gap-6", className)} {...props}>
			{signUp !== true && signIn !== true && (
				<>
					<form>
						<div className="grid gap-2">
							<div className="grid gap-1">
								<Label className="sr-only" htmlFor="email">
									Email
								</Label>
								<Input
									id="email"
									placeholder="name@example.com"
									type="email"
									onChange={(e) => setEmail(e.target.value)}
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect="off"
									disabled={isLoading}
								/>
								<p className="text-red-500 text-xs pl-2">{error?.email}</p>
							</div>
							<Button disabled={isLoading} onClick={onSubmit} className="mt-1">
								{isLoading && (
									<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
								)}
								Sign In with Password
							</Button>
						</div>
					</form>
					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<span className="w-full border-t" />
						</div>
						<div className="relative flex justify-center text-xs uppercase">
							<span className="bg-background px-2 text-muted-foreground">
								Or continue with
							</span>
						</div>
					</div>
					<div className="flex gap-y-2 flex-col">
						{/* <Button
							variant="outline"
							type="button"
							disabled={isLoading}
							onClick={async () => {
								setIsLoading(true);
								const res = await SocialSignIn("github", { callbackUrl: "/" });
								console.log("res", res);
								setIsLoading(false);
							}}
						>
							{isLoading ? (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Icons.gitHub className="mr-2 h-4 w-4" />
							)}{" "}
							GitHub
						</Button> */}
						<Button
							variant="outline"
							type="button"
							disabled={isLoading}
							onClick={async () => {
								setIsLoading(true);
								const res = await SocialSignIn("google", { callbackUrl: "/" });
								console.log("res", res);
								setIsLoading(false);
							}}
						>
							{isLoading ? (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							) : (
								<Icons.google className="mr-2 h-4 w-4" />
							)}{" "}
							Google
						</Button>
					</div>
				</>
			)}
			{signIn === true && (
				<form onSubmit={onSignInSubmit}>
					<div className="grid gap-2">
						<div className="grid gap-1">
							<Label className="sr-only" htmlFor="Password">
								Password
							</Label>
							<Input
								id="Password"
								placeholder="Password"
								onChange={(e) =>
									setSignUpData((prev) => ({
										...prev,
										password: e.target.value,
									}))
								}
								type="password"
								autoCapitalize="none"
								autoComplete="current-password"
								autoCorrect="off"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs pl-2">{error?.password}</p>
						</div>
						<Button disabled={isLoading}>
							{isLoading && (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							)}
							Sign In
						</Button>
					</div>
				</form>
			)}
			{signUp === true && (
				<form onSubmit={onSignUpSubmit}>
					<div className="grid gap-2">
						<div className="grid gap-1">
							<Label className="sr-only" htmlFor="firstName">
								First Name
							</Label>
							<Input
								id="firstName"
								placeholder="John"
								type="text"
								onChange={(e) =>
									setSignUpData((prev) => ({
										...prev,
										firstName: e.target.value,
									}))
								}
								autoCapitalize="none"
								autoComplete="firstname"
								autoCorrect="off"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs pl-2">{error?.firstName}</p>
						</div>
						<div className="grid gap-1">
							<Label className="sr-only" htmlFor="lastName">
								Last Name
							</Label>
							<Input
								id="lastName"
								onChange={(e) =>
									setSignUpData((prev) => ({
										...prev,
										lastName: e.target.value,
									}))
								}
								placeholder="Reaper"
								type="text"
								autoCapitalize="none"
								autoComplete="lastname"
								autoCorrect="off"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs pl-2">{error?.lastName}</p>
						</div>
						<div className="grid gap-1">
							<Label className="sr-only" htmlFor="password">
								Password
							</Label>
							<Input
								id="password"
								placeholder="********"
								onChange={(e) =>
									setSignUpData((prev) => ({
										...prev,
										password: e.target.value,
									}))
								}
								type="password"
								autoCapitalize="none"
								autoComplete="password"
								autoCorrect="off"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs pl-2">{error?.password}</p>
						</div>
						<div className="grid gap-1">
							<Label className="sr-only" htmlFor="password">
								Current Password
							</Label>
							<Input
								id="cpassword"
								placeholder="********"
								onChange={(e) =>
									setSignUpData((prev) => ({
										...prev,
										cpassword: e.target.value,
									}))
								}
								type="password"
								autoCapitalize="none"
								autoComplete="none"
								autoCorrect="off"
								disabled={isLoading}
							/>
							<p className="text-red-500 text-xs pl-2">{error?.cpassword}</p>
						</div>
						<Button disabled={isLoading} className="mt-2">
							{isLoading && (
								<Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
							)}
							Sign Up
						</Button>
					</div>
				</form>
			)}
		</div>
	);
}
