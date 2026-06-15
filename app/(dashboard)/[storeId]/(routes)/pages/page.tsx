import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { PageColumn } from "./components/columns";
import PagesClient from "./components/client";

const PagesPage = async ({ params }: { params: { storeId: string } }) => {
  const pages = await prismadb.page.findMany({
    where: { storeId: params.storeId },
    orderBy: { createdAt: "desc" },
  });

  const formattedPages: PageColumn[] = pages.map((item) => ({
    id: item.id,
    title: item.title,
    slug: item.slug,
    isPublished: item.isPublished ? "Yes" : "No",
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PagesClient data={formattedPages} />
      </div>
    </div>
  );
};
export default PagesPage;
