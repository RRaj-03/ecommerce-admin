import prismadb from "@/lib/prismadb";
import PageForm from "./components/page-form";

const PagePage = async ({
  params,
}: {
  params: { pageId: string; storeId: string };
}) => {
  const page = await prismadb.page.findUnique({
    where: {
      id: params.pageId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <PageForm initialData={page} />
      </div>
    </div>
  );
};
export default PagePage;
