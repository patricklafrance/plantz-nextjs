import { Divider, StyleProps, useColorModeValue } from "@chakra-ui/react";

export function ShortDivider(props: StyleProps) {
    return (
        <Divider
            {...props}
            backgroundColor={useColorModeValue("gray.700", "gray.100")}
            opacity={1}
            height="1px"
            width="70px"
            marginTop="0.75rem !important"
        />
    );
}
