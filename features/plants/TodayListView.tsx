import { Box, Divider, Heading, Stack } from "@chakra-ui/react";

import { PlantSummaryModel } from "./models";
import { useMemo } from "react";

/*
TODO:
    - PlantListModel
    - DuePlantModel
*/

export interface TodayListViewProps {
    plants: PlantSummaryModel[];
}

interface ListItemProps {
    plant: PlantSummaryModel;
}

function ListItem({ plant }: ListItemProps) {
    return (
        <span>{plant.name}</span>
    );
}

export function TodayListView({ plants }: TodayListViewProps) {
    const byLocation = useMemo(() => {
        const result = plants?.reduce((acc, x: PlantSummaryModel) => {
            if (acc[x.location]) {
                acc[x.location].push(x);
            } else {
                acc[x.location] = [x];
            }

            return acc;
        }, {} as Record<string, PlantSummaryModel[]>) ?? {};

        return Object.keys(result).sort().reduce((acc, x: string) => {
            acc[x] = result[x];

            return acc;
        }, {} as Record<string, PlantSummaryModel[]>);
    }, [plants]);

    return (
        <>
            {Object.keys(byLocation).map(x => (
                <Stack spacing={6} key={x}>
                    <Box>
                        <Heading
                            as="h3"
                            size="lg"
                            textTransform="capitalize"
                            marginBottom={7}
                        >
                            {x}
                        </Heading>
                        <Stack>
                            {byLocation[x].map((y: PlantSummaryModel, index) => (
                                <Box
                                    _last={{
                                        marginBottom: 7
                                    }}
                                    key={index}
                                >
                                    <ListItem plant={y} />
                                    {index + 1 !== byLocation[x].length && (
                                        <Divider marginTop={2} />
                                    )}
                                </Box>
                            ))}
                        </Stack>
                    </Box>
                </Stack>
            ))}
        </>
    );
}
