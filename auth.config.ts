import type { Account, NextAuthOptions, Profile, User } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prismadb from "./lib/prismadb";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT } from "next-auth/jwt";
import { id } from "date-fns/locale";
export const authConfig: NextAuthOptions = {
	session: {
		strategy: "jwt",
	},
	pages: {
		signIn: "/signin",
		signOut: "/signout",
		error: "/signin",
		newUser: "/signin?newUser=true",
	},
	callbacks: {
		signIn: async ({ user, account, profile }) => {
			if (account && account.type === "oauth") {
				console.log("account", profile);
				const user = await prismadb.user.findUnique({
					where: { email: profile!.email! },
					select: { id: true, email: true, firstName: true, lastName: true },
				});
				console.log("user", user);
				if (user) {
					return true;
				}
				console.log("profile", profile);
				const newUser = await prismadb.user.create({
					data: {
						email: profile!.email!,
						firstName: profile?.given_name
							? profile?.given_name
							: profile?.name,
						lastName: profile?.family_name ? profile?.family_name : "",
						password: bcrypt.hashSync(profile!.email!, 10),
						isOwner: false,
						image: {
							create: {
								url: profile?.picture!,
							},
						},
					},
					select: { id: true, email: true, firstName: true, lastName: true },
				});
				console.log("newUser", newUser);
			}
			return true;
		},
	},
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID!,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
			authorization: {
				params: {
					prompt: "consent",
					access_type: "offline",
					response_type: "code",
				},
			},
		}),
		// GitHubProvider({
		// 	clientId: process.env.GITHUB_CLIENT_ID!,
		// 	clientSecret: process.env.GITHUB_CLIENT_SECRET!,
		// 	authorization: {
		// 		params: {
		// 			prompt: "consent",
		// 			access_type: "offline",
		// 			response_type: "code",
		// 		},
		// 	},
		// }),
		CredentialsProvider({
			name: "Credentials",
			credentials: {
				email: { label: "email", type: "email", placeholder: "abc@xyz.in" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials, req) {
				console.log("first");
				if (credentials === null || credentials === undefined) return null;
				console.log("second");
				if (!credentials.email || !credentials.password) return null;
				console.log("third");
				try {
					const User = await prismadb.user.findUnique({
						where: { email: credentials.email },
						select: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
							password: true,
							image: true,
						},
					});
					console.log("fourth");
					if (!User) throw new Error("User not found");
					console.log("five");
					const passwordMatch = await bcrypt.compare(
						credentials.password,
						User.password
					);
					const newUser = {
						id: User.id,
						email: User.email,
						firstName: User.firstName,
						lastName: User.lastName,
						image: User?.image?.url,
					};
					console.log("six");
					if (!passwordMatch) throw new Error("Invalid credentials");
					console.log("seven");
					return newUser;
				} catch (e: any) {
					console.log("e", e);
					return null;
				}
			},
		}),
	],
};
