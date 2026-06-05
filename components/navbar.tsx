import { auth } from "@/lib/auth";
import React from "react";
import { MainNav } from "./mainNav";
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
  const stores = await prismadb.store.findMany({ where: { userId } });

  return (
    <div className="border-b shadow-md">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />
        <MainNav className="mx-6" />
        <div className="ml-auto flex items-center space-x-3">
          <ThemeToggle />
          <AdminNavUser name={session.name || "Admin"} />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
