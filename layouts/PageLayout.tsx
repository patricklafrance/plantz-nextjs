import { Box, Flex, HStack, Link, Text, useColorModeValue } from "@chakra-ui/react";

import { ColorModeToggler } from "./ColorModeToggler";
import { default as Head } from "next/head";
import { default as NextLink } from "next/link";
import { ReactNode } from "react";

export interface PageLayoutProps {
    children: ReactNode;
    pageTitle?: string;
}

const PageMarginX: any = { base: 4, sm: 12 };

export const PageMarginBottom = 12;

export function PageHeader() {
    return (
        <Flex
            alignItems="center"
            paddingX={PageMarginX}
            paddingY={2}
            marginBottom={7}
            backgroundColor={useColorModeValue("gray.50", "gray.900")}
        >
            <HStack flexGrow={1} spacing={14}>
                <NextLink href="/plants" passHref>
                    <Link fontSize="2xl" fontWeight="500">Plantz</Link>
                </NextLink>
                <HStack spacing={8}>
                    <NextLink href="/today" passHref>
                        <Link fontWeight="500">Today</Link>
                    </NextLink>
                    <NextLink href="/plants" passHref>
                        <Link fontWeight="500">Plants</Link>
                    </NextLink>
                </HStack>
            </HStack>
            <ColorModeToggler />
        </Flex>
    );
}

export function PageContent({ children }: { children: ReactNode }) {
    return (
        <Box flexGrow={1} marginX={PageMarginX} marginBottom={PageMarginBottom}>
            {children}
        </Box>
    );
}

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
