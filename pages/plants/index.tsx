import { PageSize, searchPlants } from "@features/plants/server";
import { PlantListView, PlantListViewProps, toPlantListModel } from "@features/plants";

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
                data: results.map(x => toPlantListModel(x)),
                nextPage: totalCount > PageSize ? 2 : null,
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
