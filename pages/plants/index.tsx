import { PlantListView, PlantListViewProps } from "@features/plants";

import { AuthenticatedLayout } from "@layouts";
import { GetServerSideProps } from "next";
import { ReactNode } from "react";
import { getUserId } from "@core/auth/getUserId";
import { isNil } from "@core/utils";

export default function PlantsPage(props: PlantListViewProps) {
    return (
        <PlantListView {...props} />
    );
}

PlantsPage.getLayout = (page: ReactNode) => {
    return (
        <AuthenticatedLayout pageTitle="Plants">
            {page}
        </AuthenticatedLayout>
    );
};

// TODO: query should probably go client side.
export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
    const userId = await getUserId(req);

    const searchQuery =  query.query as string | undefined;

    const props: PlantListViewProps = {
        userId
    };

    if (!isNil(searchQuery)) {
        props.query = searchQuery;
    }

    return {
        props
    };
};
