import type { Account, NextAuthOptions, Profile, User } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import prismadb from "./lib/prismadb";
import bcrypt from "bcryptjs";
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
	secret: process.env.NEXTAUTH_SECRET!,
	callbacks: {
		signIn: async ({ user, account, profile }) => {
			try {
				if (account && account.type === "oauth") {
					const user = await prismadb.user.findUnique({
						where: { email: profile!.email! },
						select: {
							id: true,
							email: true,
							firstName: true,
							lastName: true,
							isOwner: true,
						},
					});
					if (user) {
						if (!user.isOwner) {
							await prismadb.user.update({
								where: { id: user.id },
								data: {
									isOwner: true,
								},
							});
						}
						return true;
					}
					const newUser = await prismadb.user.create({
						data: {
							email: profile!.email!,
							firstName: profile?.given_name
								? profile?.given_name
								: profile?.name,
							lastName: profile?.family_name ? profile?.family_name : "",
							password: bcrypt.hashSync(profile!.email!, 10),
							isOwner: true,
							image: {
								create: {
									url: profile?.picture!,
								},
							},
						},
						select: { id: true, email: true, firstName: true, lastName: true },
					});
				}
				return true;
			} catch (e) {
				console.log(e);
				return false;
			}
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
				if (credentials === null || credentials === undefined) return null;
				if (!credentials.email || !credentials.password) return null;
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
							isOwner: true,
						},
					});
					if (!User) throw new Error("User not found");
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
					if (!passwordMatch) throw new Error("Invalid credentials");
					if (!User.isOwner) {
						await prismadb.user.update({
							where: { id: User.id },
							data: {
								isOwner: true,
							},
						});
					}
					return newUser;
				} catch (e: any) {
					console.log("e", e);
					return null;
				}
			},
		}),
	],
};
