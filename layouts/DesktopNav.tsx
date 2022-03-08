import { Flex, HStack, Link, useColorModeValue } from "@chakra-ui/react";

import { ColorModeToggler } from "./ColorModeToggler";
import { Logo } from "./Logo";
import { NavComponentProps } from "./useNavComponent";
import { default as NextLink } from "next/link";
import { PageMarginX } from "./PageContent";
import { UserMenu } from "./UserMenu";
import { isNil } from "@core/utils";
import { useRouter } from "next/router";

interface NavLinkProps {
    href: string;
    text: string;
}

function DesktopLink({ href, text }: NavLinkProps) {
    const router = useRouter();

    const isCurrent = router.route === href;

    const selectedStyle = {
        backgroundColor: useColorModeValue("gray.700", "gray.100"),
        bottom: 0,
        content: "\"\"",
        display: "block",
        height: "2px",
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
                    _before: selectedStyle,
                    textDecoration: "none"
                }}
                _before={isCurrent ? selectedStyle : undefined}
            >
                {text}
            </Link>
        </NextLink>
    );
}

export function DesktopNav({ isAuthenticated, links }: NavComponentProps) {
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
                <Logo />
                {isAuthenticated && !isNil(links) && (
                    <HStack as="nav" spacing={{ base: 8, md: 10 }}>
                        {links.map((x) => (
                            <DesktopLink key={x.label} href={x.href} text={x.label} />
                        ))}
                    </HStack>
                )}
            </HStack>
            {isAuthenticated ? <UserMenu /> : <ColorModeToggler />}
        </Flex>
    );
}
