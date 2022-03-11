import { Avatar, Box, Button, Heading, Select, Text } from "@chakra-ui/react";
import { ChangeEvent, useCallback } from "react";
import { LicensingStatus, LicensingStatusValuesAndLabels } from "./models";
import { UserIdContext, useContextUserId } from "@core/auth";
import { useFetchUser, useGenerateFakeData, useUpdateLicensingStatus } from "./http";

import { PageMarginBottom } from "@layouts";
import { isNil } from "lodash";

export interface AccountViewProps {
    userId: string;
}

interface LicensingStatusSelectProps {
    licensingStatus: LicensingStatus;
}

function LicensingStatusSelect({ licensingStatus }: LicensingStatusSelectProps) {
    const userId = useContextUserId();

    const { isLoading, mutateAsync: updateLicensingStatus } = useUpdateLicensingStatus();

    const handleChange = useCallback((event: ChangeEvent<HTMLSelectElement>) => {
        updateLicensingStatus({
            licensingStatus: event.target.value as LicensingStatus,
            userId
        });
    }, [updateLicensingStatus, userId]);

    return (
        <Select
            defaultValue={licensingStatus}
            onChange={handleChange}
            isDisabled={isLoading}
            maxWidth="200px"
        >
            {Object.keys(LicensingStatusValuesAndLabels).map(x => (
                <option value={x} key={x}>{LicensingStatusValuesAndLabels[x as keyof typeof LicensingStatusValuesAndLabels]}</option>
            ))}
        </Select>
    );
}

function ResetFakeDataButton() {
    const userId = useContextUserId();

    const { isLoading, mutate: generateFakeData } = useGenerateFakeData();

    const handleResetFakeData = useCallback(() => {
        generateFakeData({
            fake: true,
            pageCount: 5,
            userId
        });
    }, [generateFakeData, userId]);

    return (
        <Button
            isLoading={isLoading}
            onClick={handleResetFakeData}
            marginTop={8}
        >
            Reset fake data
        </Button>
    );
}

export function AccountView({ userId }: AccountViewProps) {
    const { data: user } = useFetchUser(userId);

    if (isNil(user)) {
        return null;
    }

    return (
        <UserIdContext.Provider
            value={{
                userId
            }}
        >
            <Box marginBottom={PageMarginBottom}>
                <Heading as="h1" marginBottom={12}>Account</Heading>
                <Avatar
                    size="xl"
                    name={user.name}
                    src={user.image}
                    marginBottom={8}
                />
                <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Name</Heading>
                <Text as="span">{user.name}</Text>
                <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Email</Heading>
                <Text>{user.email}</Text>
                <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Id</Heading>
                <Text>{user.id}</Text>
                <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Licensing status</Heading>
                <LicensingStatusSelect licensingStatus={user.licensingStatus} />
                <ResetFakeDataButton />
            </Box>
        </UserIdContext.Provider>
    );
}
