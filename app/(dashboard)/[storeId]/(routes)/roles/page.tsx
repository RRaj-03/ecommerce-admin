import prismadb from "@/lib/prismadb";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RolesClient } from "./components/roles-client";

const RolesPage = async ({
  params,
}: {
  params: { storeId: string };
}) => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const roles = await prismadb.role.findMany({
    where: { storeId: params.storeId },
    include: {
      permissions: true,
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const members = await prismadb.storeMember.findMany({
    where: { storeId: params.storeId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      role: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const store = await prismadb.store.findUnique({
    where: { id: params.storeId },
    select: { userId: true },
  });

  const owner = store
    ? await prismadb.adminUser.findUnique({
        where: { id: store.userId },
        select: { id: true, name: true, email: true },
      })
    : null;

  const invites = await prismadb.storeInvite.findMany({
    where: { storeId: params.storeId, status: "pending" },
    include: {
      role: { select: { id: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const isOwner = store?.userId === userId;

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <RolesClient
          roles={roles}
          members={members}
          owner={owner}
          invites={invites}
          isOwner={isOwner}
          storeId={params.storeId}
        />
      </div>
    </div>
  );
};

export default RolesPage;
