import { DesktopNav } from "./DesktopNav";
import { FunctionComponent } from "react";
import { MobileNav } from "./MobileNav";
import { useBreakpointValue } from "@chakra-ui/react";

export interface NavLink {
    href: string;
    label: string;
}

export interface NavComponentProps {
    isAuthenticated?: boolean;
    links?: NavLink[];
}

// TODO: consider https://www.joshwcomeau.com/react/the-perils-of-rehydration/
export function useNavComponent() {
    const component = useBreakpointValue<FunctionComponent<NavComponentProps>>({ base: MobileNav, md: DesktopNav });

    // Fallback for SSR.
    return component ?? DesktopNav;
}
