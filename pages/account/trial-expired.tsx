import { TrialExpiredView, TrialExpiredViewProps } from "@features/account";

import { AuthenticatedLayout } from "@layouts";
import { GetServerSideProps } from "next";
import { ReactNode } from "react";
import { getUserId } from "@core/auth/server";

export default function TrialExpiredPage(props: TrialExpiredViewProps) {
    return (
        <TrialExpiredView {...props} />
    );
}

TrialExpiredPage.getLayout = (page: ReactNode) => {
    return (
        <AuthenticatedLayout pageTitle="Trial expired">
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
