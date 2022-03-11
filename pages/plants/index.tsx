import { PlantListView, PlantListViewProps } from "@features/plants";

import { AuthenticatedLayout } from "@layouts";
import { GetServerSideProps } from "next";
import { ReactNode } from "react";
import { getUserId } from "@core/auth/getUserId";

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

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const userId = await getUserId(req);

    const props: PlantListViewProps = {
        userId
    };

    return {
        props
    };
};
