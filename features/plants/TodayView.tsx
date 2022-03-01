import { ApiErrorBoundary, ApiErrorBoundaryFallbackProps, buildUrl } from "@core/api/http";
import { Box, Divider, Grid, HStack, Heading, IconButton, Link, Stack, StyleProps, Tag, TagLabel, TagLeftIcon, Text, useColorModeValue } from "@chakra-ui/react";
import { CSSProperties, ReactNode, useCallback, useMemo } from "react";
import { DuePlantModel, LocationValuesAndLabels, WateringTypeValuesAndLabels } from "./models";
import { PlantInfoModal, PlantInfoViewMode, PlantInfoViewModes } from "./PlantInfoModal";
import { TimeIcon, ViewIcon } from "@chakra-ui/icons";

import { AddPlantModal } from "./AddPlantModal";
import { Error } from "@components";
import { default as NextLink } from "next/link";
import { RiLeafLine } from "react-icons/ri";
import { TodayUrl } from "@routes";
import { getPrettyWaterFrequency } from "./getPrettyWaterFrequency";
import { prefetchPlant } from "./http";
import { toFormattedWateringDate } from "./wateringDate";
import { transparentize } from "@chakra-ui/theme-tools";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";

export interface TodayViewProps {
    plants: DuePlantModel[];
}

interface ViewLinkProps {
    children: ReactNode;
    plantId: string;
}

function ViewLink({ children, plantId }: ViewLinkProps) {
    const href = buildUrl(TodayUrl, {
        action: "view",
        id: plantId,
        viewMode: PlantInfoViewModes.preview
    });

    return (
        <NextLink
            href={href}
            as={`${TodayUrl}/${PlantInfoViewModes.preview}/${plantId}`}
            passHref
            shallow
        >
            {children}
        </NextLink>
    );
}

interface NameLinkProps {
    name: string;
    plantId: string;
}

function NameLink({ name, plantId }: NameLinkProps) {
    const queryClient = useQueryClient();

    const handleMouseEnter = useCallback(() => prefetchPlant(queryClient, plantId), [plantId, queryClient]);

    return (
        <ViewLink plantId={plantId}>
            <Link
                fontSize="lg"
                fontWeight="500"
                onMouseEnter={handleMouseEnter}
            >
                {name}
            </Link>
        </ViewLink>
    );
}

interface ViewButtonProps {
    plantId: string;
}

function ViewButton({ plantId }: ViewButtonProps) {
    const queryClient = useQueryClient();

    const handleMouseEnter = useCallback(() => prefetchPlant(queryClient, plantId), [plantId, queryClient]);

    return (
        <ViewLink plantId={plantId}>
            <IconButton
                as="a"
                icon={<ViewIcon />}
                aria-label="View plant info"
                size="lg"
                isRound
                title="View plant info"
                onMouseEnter={handleMouseEnter}
            />
        </ViewLink>
    );
}

interface ListItemProps extends StyleProps {
    plant: DuePlantModel;
    style?: CSSProperties;
}

function ListItem({ plant, style }: ListItemProps) {
    return (
        <Stack
            direction={{ base: "column", sm: "row" }}
            spacing={{ base: 6, lg: 12 }}
            paddingTop={4}
            paddingBottom={4}
            paddingLeft={2}
            paddingRight={2}
            style={style}
            _hover={{
                backgroundColor: transparentize(useColorModeValue("gray.100", "gray.700"), 0.3)
            }}
        >
            <Grid
                templateAreas={{ base: "\"name watering-qty watering-type\" \"tags tags tags\"", lg: "\"name watering-qty watering-type tags\"" }}
                templateColumns={{ lg: "300px 140px 140px auto" }}
                gap={{ base: 6, lg: 0 }}
                flexGrow={1}
            >
                <Box gridArea="name">
                    <NameLink name={plant.name} plantId={plant.id} />
                    <Text color="gray.400">{plant.family}</Text>
                </Box>
                <Box gridArea="watering-qty">
                    <Text fontSize="lg" fontWeight="500">{plant.wateringQuantity}</Text>
                    <Text color="gray.400">every {getPrettyWaterFrequency(plant.wateringFrequency)}</Text>
                </Box>
                <Box gridArea="watering-type">
                    <Text fontSize="lg" fontWeight="500">{WateringTypeValuesAndLabels[plant.wateringType as keyof typeof WateringTypeValuesAndLabels]}</Text>
                    <Text color="gray.400">watering</Text>
                </Box>
                <HStack gridArea="tags" flexWrap="wrap" gap={4}>
                    <Tag colorScheme="pink" size="lg" marginInlineStart="0 !important">
                        <TagLeftIcon as={TimeIcon} />
                        <TagLabel>{toFormattedWateringDate(plant.nextWateringDate)}</TagLabel>
                    </Tag>
                    {plant.mistLeaves && (
                        <Tag colorScheme="green" size="lg">
                            <TagLeftIcon as={RiLeafLine} />
                            <TagLabel>Mist leaves</TagLabel>
                        </Tag>
                    )}
                </HStack>
            </Grid>
            <HStack spacing={4}>
                <ViewButton plantId={plant.id} />
            </HStack>
        </Stack>
    );
}

interface ListProps {
    plants: DuePlantModel[];
}

function List({ plants }: ListProps) {
    const byLocation = useMemo(() => {
        const result = plants?.reduce((acc, x: DuePlantModel) => {
            if (acc[x.location]) {
                acc[x.location].push(x);
            } else {
                acc[x.location] = [x];
            }

            return acc;
        }, {} as Record<string, DuePlantModel[]>) ?? {};

        return Object.keys(result).sort().reduce((acc, x: string) => {
            acc[x] = result[x];

            return acc;
        }, {} as Record<string, DuePlantModel[]>);
    }, [plants]);

    return (
        <>
            {Object.keys(byLocation).map(x => (
                <Stack spacing={6} key={x}>
                    <Box>
                        <Heading
                            as="h3"
                            size="md"
                            marginBottom={4}
                            marginLeft={2}
                        >
                            {LocationValuesAndLabels[x as keyof typeof LocationValuesAndLabels]}
                        </Heading>
                        <Stack>
                            {byLocation[x].map((y: DuePlantModel, index) => (
                                <Box
                                    _last={{
                                        marginBottom: 10
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

export function TodayView({ plants }: TodayViewProps) {
    const router = useRouter();

    const handleCloseModal = useCallback(() => {
        router.push(TodayUrl, undefined, { shallow: true });
    }, [router]);

    return (
        <>
            <Text
                as="div"
                fontSize="2xl"
                fontWeight="500"
                marginLeft={2}
                marginBottom={8}
            >
                These plants needs water today!
            </Text>
            <ApiErrorBoundary fallbackRender={({ error, resetErrorBoundary }: ApiErrorBoundaryFallbackProps) => (
                <Error
                    message="We currently cannot load plants, please try again in a few seconds."
                    detail={error.message}
                    onTryAgain={resetErrorBoundary}
                />
            )}>
                <List plants={plants} />
            </ApiErrorBoundary>
            <PlantInfoModal
                allowEdit={false}
                initialViewMode={router.query.viewMode as PlantInfoViewMode}
                isOpen={router.query.action === "view"}
                onClose={handleCloseModal}
                plantId={router.query.id as string}
            />
        </>
    );
}
