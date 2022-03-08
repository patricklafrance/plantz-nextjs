import { Alert, AlertIcon, Button, Flex, HStack, Heading, Link, Text } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import { default as NextLink } from "next/link";
import { TodayRoute } from "@routes";
import { useGenerateFakeData } from "./http";
import { useRouter } from "next/router";

export interface NewUserViewProps {
    userId: string;
}

export function NewUserView({ userId }: NewUserViewProps) {
    const [hasGeneratedFakeData, setHasGeneratedFakeData] = useState(false);

    const router = useRouter();

    const { isLoading, mutateAsync: generateFakeData } = useGenerateFakeData();

    useEffect(() => {
        if (hasGeneratedFakeData) {
            setTimeout(() => {
                router.push(TodayRoute);
            }, 2000);
        }
    }, [hasGeneratedFakeData, router]);

    const handleGenerateFakeData = useCallback(async () => {
        await generateFakeData({
            fake: true,
            pageCount: 5,
            userId
        });

        setHasGeneratedFakeData(true);
    }, [generateFakeData, userId]);

    return (
        <Flex
            justifyContent="center"
            position="relative"
            top="30%"
        >
            <Flex
                direction="column"
                alignItems="center"
            >
                <Heading
                    as="h1"
                    size="2xl"
                    marginBottom={8}
                >
                    Welcome to Plantz
                </Heading>
                <Text
                    as="div"
                    fontSize="md"
                    color="gray.400"
                    textAlign="center"
                >
                    Your account doesn't contains any data.<br />If you wish to generate fake data, click on the <b>Generate fake data</b> button bellow, otherwise click on the <b>Continue</b> button.
                </Text>
                <HStack marginTop={10} spacing={6}>
                    <Button
                        colorScheme="teal"
                        onClick={handleGenerateFakeData}
                        isLoading={isLoading}
                        isDisabled={hasGeneratedFakeData}
                    >
                        Generate fake data
                    </Button>
                    <NextLink
                        href={TodayRoute}
                        passHref
                    >
                        <Link>Continue</Link>
                    </NextLink>
                </HStack>
                {hasGeneratedFakeData && (
                    <Alert status="success" variant="solid" borderRadius="lg" marginTop={8}>
                        <AlertIcon />
                        Fake have been generated! You'll be redirected in a second...
                    </Alert>
                )}
            </Flex>
        </Flex>
    );
}
