import { Box, Flex, HStack, Link, useColorModeValue } from "@chakra-ui/react";
import { PlantListUrl, TodayUrl } from "@routes";

import { ColorModeToggler } from "./ColorModeToggler";
import { default as Head } from "next/head";
import { default as NextLink } from "next/link";
import { ReactNode } from "react";
import { useRouter } from "next/router";

export interface PageLayoutProps {
    children: ReactNode;
    pageTitle?: string;
}

const PageMarginX: any = { base: 4, sm: 12 };

export const PageMarginBottom = 12;

interface MenuLinkProps {
    href: string;
    text: string;
}

function MenuLink({ href, text }: MenuLinkProps) {
    const router = useRouter();

    const isCurrent = router.route === href;

    const currentColor = useColorModeValue("gray.700", "gray.100");
    const hoverColor = useColorModeValue("gray.300", "gray.500");

    const underlineStyle = {
        bottom: 0,
        content: "\"\"",
        display: "block",
        height: 1,
        position: "absolute",
        width: "100%"
    };

    return (
        <NextLink
            href={href}
            passHref
        >
            <Link
                fontWeight={500}
                paddingTop={2}
                paddingBottom={2}
                position="relative"
                _hover={{
                    _before: {
                        ...underlineStyle,
                        backgroundColor: hoverColor
                    }
                }}
                _before={isCurrent ? {
                    ...underlineStyle,
                    backgroundColor: currentColor
                } : undefined}
            >
                {text}
            </Link>
        </NextLink>
    );
}

export function PageHeader() {
    return (
        <Flex
            alignItems="center"
            paddingX={PageMarginX}
            paddingY={2}
            marginBottom={7}
            marginLeft={2}
            marginRight={2}
            backgroundColor={useColorModeValue("gray.50", "gray.900")}
        >
            <HStack flexGrow={1} spacing={{ base: 14, md: 20 }}>
                <NextLink href={TodayUrl} passHref>
                    <Link
                        fontSize="2xl"
                        fontWeight="500"
                        _hover={{
                            textDecoration: "none"
                        }}
                    >
                        Plantz
                    </Link>
                </NextLink>
                <HStack spacing={{ base: 8, md: 10 }}>
                    <MenuLink href={TodayUrl} text="Today" />
                    <MenuLink href={PlantListUrl} text="Plants" />
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
