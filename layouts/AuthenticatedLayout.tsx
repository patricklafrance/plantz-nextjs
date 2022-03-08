import { NavLink, useNavComponent } from "./useNavComponent";
import { PlantListRoute, TodayRoute } from "@routes";

import { Flex } from "@chakra-ui/react";
import { default as Head } from "next/head";
import { PageContent } from "./PageContent";
import { ReactNode } from "react";

export interface AuthenticatedLayoutProps {
    children: ReactNode;
    pageTitle: string;
}

const Links: NavLink[] = [
    { href: TodayRoute, label: "Today" },
    { href: PlantListRoute, label: "Plants" }
];

function PageHeader() {
    const Nav = useNavComponent();

    return (
        <Nav links={Links} isAuthenticated />
    );
}

export function AuthenticatedLayout({ children, pageTitle }: AuthenticatedLayoutProps) {
    return (
        <Flex direction="column" height="100%">
            <Head>
                <title>{pageTitle ?? "Plantz"}</title>
            </Head>
            <PageHeader />
            <PageContent>{children}</PageContent>
        </Flex>
    );
}
