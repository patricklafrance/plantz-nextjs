import { PlantListView, PlantListViewProps, toPlantSummaryModel } from "@features/plants";
import { SearchPlantsPageSize, searchPlants } from "@features/plants/server";

import { GetServerSideProps } from "next";
import { isNil } from "@core/utils";

export default function PlantsPage(props: PlantListViewProps) {
    return (
        <PlantListView {...props} />
    );
}

PlantsPage.pageTitle = "Plants";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const searchQuery =  query.query as string | undefined;

    const { results, totalCount } = await searchPlants(1, { query: searchQuery });

    const props: PlantListViewProps = {
        plants: {
            pageParams: [1],
            pages: [{
                data: toPlantSummaryModel(results),
                nextPage: totalCount > SearchPlantsPageSize ? 2 : null,
                previousPage: null,
                totalCount
            }]
        }
    };

    if (!isNil(searchQuery)) {
        props.query = searchQuery;
    }

    return {
        props
    };
};
