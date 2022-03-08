import { AccountView, AccountViewProps } from "@features/auth";

import { AuthenticatedLayout } from "@layouts";
import { GetServerSideProps } from "next";
import { ReactNode } from "react";
import { getUserId } from "@core/auth/getUserId";

export default function AccountPage(props: AccountViewProps) {
    return (
        <AccountView {...props} />
    );
}

AccountPage.getLayout = (page: ReactNode) => {
    return (
        <AuthenticatedLayout pageTitle="Account">
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


