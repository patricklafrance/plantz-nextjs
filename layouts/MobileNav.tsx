import {
    Box,
    Flex,
    HStack,
    IconButton,
    Link,
    Stack,
    useColorModeValue,
    useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon, HamburgerIcon } from "@chakra-ui/icons";

import { Logo } from "./Logo";
import { default as NextLink } from "next/link";
import { PageMarginX } from "./constants";
import { UserMenu } from "./UserMenu";
import { useIsAuthenticated } from "@core/auth";
import { useRouter } from "next/router";

export interface MobileNavProps {
    links: { href: string, label: string }[];
}

interface NavLinkProps {
    href: string;
    text: string;
}

function NavLink({ href, text }: NavLinkProps) {
    const router = useRouter();

    const isCurrent = router.route === href;

    const selectedStyle = {
        backgroundColor: useColorModeValue("gray.200", "gray.700"),
    };

    return (
        <NextLink
            href={href}
            passHref
        >
            <Link
                paddingX={2}
                paddingY={2}
                rounded="md"
                _hover={{
                    ...selectedStyle,
                    textDecoration: "none",
                }}
                {...(isCurrent ? selectedStyle : {})}
            >
                {text}
            </Link>
        </NextLink>
    );
}

export function MobileNav({ links }: MobileNavProps) {
    const isAuthenticated = useIsAuthenticated();

    const { isOpen, onClose, onOpen } = useDisclosure();

    return (
        <Box
            paddingX={PageMarginX}
            marginBottom={7}
            marginX={2}
            paddingY={2}
            backgroundColor={useColorModeValue("gray.50", "gray.900")}
        >
            <Flex alignItems="center">
                {isAuthenticated && (
                    <IconButton
                        icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
                        aria-label="Open Menu"
                        onClick={isOpen ? onClose : onOpen}
                    />
                )}
                <HStack flexGrow={1} justifyContent={isAuthenticated ? "center" : "initial"}>
                    <Logo />
                </HStack>
                {isAuthenticated && <UserMenu />}
            </Flex>

            {isAuthenticated && isOpen ? (
                <Box
                    marginTop={7}
                    paddingBottom={4}
                >
                    <Stack as="nav" spacing={3}>
                        {links.map(x => (
                            <NavLink key={x.label} href={x.href} text={x.label} />
                        ))}
                    </Stack>
                </Box>
            ) : null}
        </Box>
    );
}
