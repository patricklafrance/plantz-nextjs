import {
    Avatar,
    Button,
    Menu,
    MenuButton,
    MenuDivider,
    MenuItem,
    MenuList,
    useColorMode
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { signOut, useSession } from "next-auth/react";

import { useCallback } from "react";

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
            >
                <Avatar
                    size="sm"
                    src={session?.user?.image as string}
                    name={session?.user?.name as string}
                />
            </MenuButton>
            <MenuList>
                <MenuItem icon={isLight ? <MoonIcon /> : <SunIcon />} onClick={handleToggleTheme}>
                    {isLight ? "Dark theme" : "Light theme"}
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout}>
                    Sign Out
                </MenuItem>
            </MenuList>
        </Menu>
    );
}
