import { GetServerSideProps } from "next";
import { LoginView } from "@features/auth";
import { PublicLayout } from "@layouts";
import { ReactNode } from "react";
import { TodayRoute } from "@routes";
import { getSession } from "next-auth/react";
import { isNil } from "@core/utils";

export default function LoginPage() {
    return (
        <LoginView />
    );
}

LoginPage.getLayout = (page: ReactNode) => {
    return (
        <PublicLayout pageTitle="login">
            {page}
        </PublicLayout>
    );
};

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
    const session = await getSession({ req });

    if (!isNil(session)) {
        const callbackUrl = query.callbackUrl as string;

        return {
            redirect: {
                destination: !isNil(callbackUrl) ? callbackUrl : TodayRoute,
                permanent: false
            }
        };
    }

    return {
        props: {}
    };
};
