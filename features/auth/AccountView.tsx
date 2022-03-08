import { Avatar, Box, Button, Heading, SimpleGrid, Text, useColorModeValue } from "@chakra-ui/react";
import { useFetchUser, useGenerateFakeData } from "./http";

import { PageMarginBottom } from "@layouts";
import { isNil } from "lodash";
import { useCallback } from "react";

export interface AccountViewProps {
    userId: string;
}

export function AccountView({ userId }: AccountViewProps) {
    const { data: user } = useFetchUser(userId);

    const { isLoading, mutate: generateFakeData } = useGenerateFakeData();

    const labelColor = useColorModeValue("gray.600", "gray.400");

    const handleResetFakeData = useCallback(() => {
        generateFakeData({
            fake: true,
            pageCount: 5,
            userId
        });
    }, [generateFakeData, userId]);

    if (isNil(user)) {
        return null;
    }

    return (
        <Box marginBottom={PageMarginBottom}>
            <Heading as="h1" marginBottom={12}>Account</Heading>
            <Avatar
                size="xl"
                name={user.name}
                src={user.image}
                marginBottom={8}
            />
            <SimpleGrid
                columns={2}
                width="max-content"
                spacing={4}
            >
                <Text color={labelColor} fontWeight={500}>Name</Text>
                <Text>{user.name}</Text>
                <Text color={labelColor} fontWeight={500}>Email</Text>
                <Text>{user.email}</Text>
                <Text color={labelColor} fontWeight={500}>Id</Text>
                <Text>{user.id}</Text>
            </SimpleGrid>
            <Button
                isLoading={isLoading}
                onClick={handleResetFakeData}
                marginTop={8}
            >
                Reset fake data
            </Button>
        </Box>
    );
}
