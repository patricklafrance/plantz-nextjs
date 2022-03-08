import { TodayView, TodayViewProps } from "@features/plants/TodayView";

import { AuthenticatedLayout } from "@layouts";
import { GetServerSideProps } from "next";
import { ReactNode } from "react";
import { getUserId } from "@core/auth/getUserId";

export default function TodayPage(props: TodayViewProps) {
    return (
        <TodayView {...props} />
    );
}

TodayPage.getLayout = (page: ReactNode) => {
    return (
        <AuthenticatedLayout pageTitle="Today">
            {page}
        </AuthenticatedLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
    const userId = await getUserId(req);

    return {
        props: {
            userId
        }
    };
};
