import { Button, Flex, StyleProps, Text, useColorModeValue } from "@chakra-ui/react";

import { WarningTwoIcon } from "@chakra-ui/icons";

export interface ErrorProps extends StyleProps {
    detail?: string;
    message?: string;
    onTryAgain?: () => void;
}

export function Error({ detail, message, onTryAgain, ...props }: ErrorProps) {
    const color = useColorModeValue("red.500", "red.300");

    return (
        <Flex
            {...props}
            justifyContent="center"
        >
            <Flex direction="column" alignItems="center" marginTop={24}>
                <WarningTwoIcon
                    width={{ base: "140px", lg: "170px" }}
                    height={{ base: "140px", lg: "170px" }}
                    color={color}
                />
                <Flex direction="column" alignItems="center" marginTop={7}>
                    <Text color={color} textAlign="center" fontWeight="500">{message}</Text>
                    {detail && (
                        <Text
                            color={color}
                            textAlign="center"
                            fontSize="sm"
                            marginTop={2}
                        >
                            ({detail})
                        </Text>
                    )}
                    {onTryAgain && (
                        <Button
                            onClick={onTryAgain}
                            marginTop={10}
                        >
                            Try again
                        </Button>
                    )}
                </Flex>
            </Flex>
        </Flex>
    );
}
