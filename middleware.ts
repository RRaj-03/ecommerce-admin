// This example protects all routes including api/trpc routes
// Please edit this to allow other routes to be public as needed.
// See https://clerk.com/docs/nextjs/middleware for more information about configuring your middleware

import { NextRequest, NextResponse } from "next/server";
import { PUBLIC_ROUTES, SIGNIN, ROOT, PROTECTED_SUB_ROUTES } from "@/routes";
import { getServerSession } from "next-auth/next";
export default async function middleware(request: NextRequest) {
	// const { nextUrl } = request;
	// const session = await getServerSession();
	// console.log("session", session);
	// const isAuthenticated = !!session?.user;
	// console.log(isAuthenticated, nextUrl.pathname);
	// const isPublicRoute =
	// 	(PUBLIC_ROUTES.find((route) => nextUrl.pathname.startsWith(route)) ||
	// 		nextUrl.pathname === ROOT) &&
	// 	!PROTECTED_SUB_ROUTES.find((route) => nextUrl.pathname.includes(route));
	// if (!isAuthenticated && !isPublicRoute)
	// 	return NextResponse.redirect(new URL(SIGNIN, nextUrl));
	// return NextResponse.next();
}
export const config = {
	matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
