import { auth } from "@/lib/auth";
import React from "react";
import StoreSwitcher from "./storeSwitcher";
import prismadb from "@/lib/prismadb";
import { redirect } from "next/navigation";
import { ThemeToggle } from "./themeToggle";
import { AdminNavUser } from "./adminNavUser";

const Navbar = async () => {
  const { userId, session } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }
  const stores = await prismadb.store.findMany({
    where: {
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
  });

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-30">
      <div className="flex h-14 items-center px-4">
        {/* Spacer for mobile hamburger */}
        <div className="w-10 lg:hidden" />
        <StoreSwitcher items={stores} />
        <div className="ml-auto flex items-center space-x-3">
          <ThemeToggle />
          <AdminNavUser name={session.name || "Admin"} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
