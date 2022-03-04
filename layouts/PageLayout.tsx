import { Box, Flex, useBreakpointValue } from "@chakra-ui/react";
import { PageMarginBottom, PageMarginX } from "./constants";
import { PlantListRoute, TodayRoute } from "@routes";

import { DesktopNav } from "./DesktopNav";
import { default as Head } from "next/head";
import { MobileNav } from "./MobileNav";
import { ReactNode } from "react";

export interface PageLayoutProps {
    children: ReactNode;
    pageTitle?: string;
}

const Links = [
    { href: TodayRoute, label: "Today" },
    { href: PlantListRoute, label: "Plants" }
];

export function PageHeader() {
    const component = useBreakpointValue({ base: MobileNav, md: DesktopNav });

    // Fallback for SSR.
    const Nav = component ?? DesktopNav;

    return (
        // @ts-ignore
        <Nav links={Links} />
    );
}

export function PageContent({ children }: { children: ReactNode }) {
    return (
        <Box flexGrow={1} marginX={PageMarginX} marginBottom={PageMarginBottom}>
            {children}
        </Box>
    );
}

// TODO: should get session from SSR to avoir flick
export function PageLayout({ children, pageTitle }: PageLayoutProps) {
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
