import { NewAccountView, NewAccountViewProps } from "@features/account";

import { AuthenticatedLayout } from "@layouts";
import { GetServerSideProps } from "next";
import { ReactNode } from "react";
import { getUserId } from "@core/auth/server";

export default function NewAccountPage(props: NewAccountViewProps) {
    return (
        <NewAccountView {...props} />
    );
}

NewAccountPage.getLayout = (page: ReactNode) => {
    return (
        <AuthenticatedLayout pageTitle="Welcome">
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
