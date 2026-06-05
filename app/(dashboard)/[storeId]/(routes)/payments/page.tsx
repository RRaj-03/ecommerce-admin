import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import React from "react";
import PaymentsForm from "./components/payments-form";

const PaymentsPage = async ({
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

  const paymentConfig = await prismadb.paymentConfig.findUnique({
    where: { storeId: params.storeId },
  });

  return (
    <div className="flex flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PaymentsForm storeId={params.storeId} initialConfig={paymentConfig} />
      </div>
    </div>
  );
};

export default PaymentsPage;
