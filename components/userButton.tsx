"use client";
import React from "react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import Link from "next/link";

const UserButton = ({
	user,
}: {
	user: {
		id: string;
		email: string;
		firstName: string;
		lastName: string;
		image: { url: string } | null;
	};
}) => {
	return (
		<div>
			{" "}
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<Button variant="ghost" className="relative h-8 w-8 rounded-full">
						<Avatar className="h-8 w-8">
							<AvatarImage src={user?.image?.url} alt="Image" />
							<AvatarFallback>
								{(
									user.firstName
										.split(" ")
										.map((str) => str.slice(0, 1))
										.join("") +
									user.lastName
										.split(" ")
										.map((str) => str.slice(0, 1))
										.join("")
								).slice(0, 2)}
							</AvatarFallback>
						</Avatar>
					</Button>
				</DropdownMenuTrigger>
				<DropdownMenuContent className="w-56" align="end" forceMount>
					<DropdownMenuLabel className="font-normal">
						<div className="flex flex-col space-y-1">
							<p className="text-sm font-medium leading-none">
								{(user.firstName + " " + user.lastName).slice(0, 20)}
							</p>
							<p className="text-xs leading-none text-muted-foreground">
								{user.email}
							</p>
						</div>
					</DropdownMenuLabel>
					<DropdownMenuSeparator />
					<DropdownMenuGroup>
						<Link href={"/profile"}>
							<DropdownMenuItem>Profile</DropdownMenuItem>
						</Link>
						<Link href={"/profile/settings"}>
							<DropdownMenuItem>Settings</DropdownMenuItem>
						</Link>
					</DropdownMenuGroup>
					<DropdownMenuSeparator />
					<DropdownMenuItem
						onClick={async () => {
							await signOut({ callbackUrl: "/auth" });
						}}
					>
						Sign out
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
		</div>
	);
};

export default UserButton;
