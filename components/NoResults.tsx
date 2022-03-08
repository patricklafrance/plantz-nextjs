import { Button, Flex, StyleProps, Text } from "@chakra-ui/react";
import { ReactElement, ReactNode, cloneElement } from "react";

import { IconProps } from "@chakra-ui/icons";

export interface NoResultProps extends StyleProps {
    children: ReactNode;
    icon: ReactElement<IconProps>;
    onClear?: () => void;
}

export function NoResults({ children, icon, onClear, ...props }: NoResultProps) {
    const iconMarkup = cloneElement(icon, {
        height: "120px",
        width: "120px"
    });

    return (
        <Flex
            {...props}
            justifyContent="center"
            position="relative"
            top="30%"
        >
            <Flex direction="column" alignItems="center">
                {iconMarkup}
                <Flex direction="column" alignItems="center">
                    <Text textAlign="center" fontWeight="500">{children}</Text>
                    {onClear && (
                        <Button
                            onClick={onClear}
                            marginTop={10}
                        >
                            Clear search
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
}
