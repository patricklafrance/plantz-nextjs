import { PlantListView, PlantModel } from "@features/plants";

import { GetServerSideProps } from "next";
import { isNil } from "@core/utils";
import { searchPlants } from "@features/plants/server";

export interface PlantsPageProps {
    plants: PlantModel[];
    query?: string;
}

export default function PlantsPage(props: PlantsPageProps) {
    return (
        <PlantListView {...props} />
    );
}

PlantsPage.pageTitle = "Plants";

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
    const searchQuery =  query.query as string | undefined;

    const plants = await searchPlants(searchQuery);

    const props: PlantsPageProps = {
        plants
    };

    if (!isNil(searchQuery)) {
        props.query = searchQuery;
    }

    return {
        props
    };
};
