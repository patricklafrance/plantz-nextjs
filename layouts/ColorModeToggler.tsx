import { IconButton, useColorMode } from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

export function ColorModeToggler() {
    const { colorMode, toggleColorMode } = useColorMode();

    return (
        <IconButton
            icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            variant="ghost"
            aria-label="Toggle theme"
            onClick={toggleColorMode}
            title="Toggle theme"
        />
    );
}
