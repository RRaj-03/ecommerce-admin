import prismadb from "@/lib/prismadb";
import React from "react";
import FilterForm from "../components/filterForm";
import { auth } from "@/actions/getAuth";

const FilterPage = async ({ params }: { params: { filterId: string } }) => {
	const { userId } = await auth();
	const filter = await prismadb.filter.findUnique({
		where: {
			id: params.filterId,
		},
	});

	return (
		<div className="flex-col">
			<div className="flex-1 space-y-4 p-8 pt-6">
				<FilterForm initialData={filter} />
			</div>
		</div>
	);
};

export default FilterPage;
