import { AccountRoute, TermsRoute } from "@routes";
import {
    Avatar,
    Button,
    Icon,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    useColorMode
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { signOut, useSession } from "next-auth/react";

import { default as NextLink } from "next/link";
import { RiUser3Line } from "react-icons/ri";
import { useCallback } from "react";
import { useUrl } from "@core/api/http";

export function UserMenu() {
    const { data: session } = useSession();

    const { colorMode, toggleColorMode } = useColorMode();

    const isLight = colorMode === "light";

    const handleToggleTheme = useCallback(() => {
        toggleColorMode();
    }, [toggleColorMode]);

    const handleLogout = useCallback(() => {
        signOut();
    }, []);


    return (
        <Menu isLazy>
            <MenuButton
                as={Button}
                rounded="full"
                variant="link"
                cursor="pointer"
                minWidth={0}
                title={session?.user?.name as string}
                _hover={{
                    textDecoration: "none"
                }}
            >
                <Avatar
                    size="sm"
                    src={session?.user?.image as string}
                    name={session?.user?.name as string}
                />
            </MenuButton>
            <MenuList>
                <NextLink href={AccountRoute} passHref>
                    <MenuItem as="a" icon={<Icon as={RiUser3Line} />}>Account</MenuItem>
                </NextLink>
                <MenuItem icon={isLight ? <MoonIcon /> : <SunIcon />} onClick={handleToggleTheme}>
                    {isLight ? "Dark theme" : "Light theme"}
                </MenuItem>
                <MenuDivider />
                <NextLink href={TermsRoute} passHref>
                    <MenuItem as="a">Terms</MenuItem>
                </NextLink>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>
                    Sign out
                </MenuItem>
            </MenuList>
        </Menu>
    );
}
