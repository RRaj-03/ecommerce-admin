import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import AppearanceForm from "./components/appearance-form";

const AppearancePage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: { id: params.storeId, userId },
  });

  if (!store) {
    redirect("/");
  }

  const theme = await prismadb.storeTheme.findUnique({
    where: { storeId: params.storeId },
  });

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <AppearanceForm storeId={params.storeId} initialTheme={theme} />
      </div>
    </div>
  );
};

export default AppearancePage;
