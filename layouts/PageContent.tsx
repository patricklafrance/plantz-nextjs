import { Box } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface PageContentProps {
    children: ReactNode;
}

export const PageMarginX: any = { base: 4, sm: 12 };

export const PageMarginBottom = 12;

export function PageContent({ children }: PageContentProps) {
    return (
        <Box flexGrow={1} marginX={PageMarginX} marginBottom={PageMarginBottom}>
            {children}
        </Box>
    );
}
