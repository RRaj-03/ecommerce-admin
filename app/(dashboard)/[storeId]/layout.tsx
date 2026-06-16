import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Navbar from "@/components/navbar";
import { Sidebar } from "@/components/sidebar";
import prismadb from "@/lib/prismadb";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { storeId: string };
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId,
      OR: [
        { userId },
        { members: { some: { userId } } },
      ],
    },
  });

  if (!store) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
