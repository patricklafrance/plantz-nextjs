import { NewUserView, NewUserViewProps } from "@features/auth";

import { AuthenticatedLayout } from "@layouts";
import { GetServerSideProps } from "next";
import { ReactNode } from "react";
import { getUserId } from "@core/auth/getUserId";

export default function NewUserPage(props: NewUserViewProps) {
    return (
        <NewUserView {...props} />
    );
}

NewUserPage.getLayout = (page: ReactNode) => {
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
