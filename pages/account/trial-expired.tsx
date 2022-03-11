import { AuthenticatedLayout } from "@layouts";
import { ReactNode } from "react";
import { TrialExpiredView } from "@features/account";

export default function TrialExpiredPage() {
    return (
        <TrialExpiredView />
    );
}

TrialExpiredPage.getLayout = (page: ReactNode) => {
    return (
        <AuthenticatedLayout pageTitle="Trial expired">
            {page}
        </AuthenticatedLayout>
    );
};
