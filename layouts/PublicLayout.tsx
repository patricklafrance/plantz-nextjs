import { Flex } from "@chakra-ui/react";
import { default as Head } from "next/head";
import { PageContent } from "./PageContent";
import { ReactNode } from "react";
import { useNavComponent } from "./useNavComponent";

export interface PublicLayoutProps {
    children: ReactNode;
    pageTitle: string;
}

function PageHeader() {
    const Nav = useNavComponent();

    return (
        <Nav />
    );
}

export function PublicLayout({ children, pageTitle }: PublicLayoutProps) {
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
