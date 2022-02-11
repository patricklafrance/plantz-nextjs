import { Button, Flex, StyleProps, Text } from "@chakra-ui/react";

import { ReactNode } from "react";
import { Search2Icon } from "@chakra-ui/icons";

export interface NoResultProps extends StyleProps {
    children: ReactNode;
    onClear?: () => void;
}

export function NoResults({ children, onClear, ...props }: NoResultProps) {
    return (
        <Flex
            {...props}
            justifyContent="center"
        >
            <Flex direction="column" alignItems="center" marginTop={24}>
                <Search2Icon
                    width="120px"
                    height="120px"
                />
                <Flex direction="column" alignItems="center" marginTop={7}>
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
