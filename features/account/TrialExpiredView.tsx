import { Button, Flex, Heading, Text } from "@chakra-ui/react";

import { TodayRoute } from "@routes";
import { useCallback } from "react";
import { useRouter } from "next/router";
import { useUpdateLicensingStatus } from "./http";

export interface TrialExpiredViewProps {
    userId: string;
}

export function TrialExpiredView({ userId }: TrialExpiredViewProps) {
    const router = useRouter();

    const { isLoading, mutateAsync: updateLicensingStatus } = useUpdateLicensingStatus();

    const handleContinue = useCallback(async () => {
        try {
            await updateLicensingStatus({
                licensingStatus: "paid",
                userId: userId
            });
        } catch (error) {
            // Log to vercel console.
            console.error(error);
        }

        router.push(TodayRoute);
    }, [updateLicensingStatus, router, userId]);

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
                    Trial expired
                </Heading>
                <Text
                    as="div"
                    fontSize="md"
                    color="gray.400"
                    textAlign="center"
                >
                    Your Plantz trial expired, you should consider buying a premium package!
                </Text>
                <Button
                    onClick={handleContinue}
                    colorScheme="teal"
                    marginTop={8}
                    isLoading={isLoading}
                >
                    Continue
                </Button>
            </Flex>
        </Flex>
    );
}
