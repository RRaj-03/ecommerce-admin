import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";

const SetupLayout = async ({ children }: { children: React.ReactNode }) => {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
  });

  if (store) {
    redirect(`/${store.id}`);
  }

  return <>{children}</>;
};

export default SetupLayout;
