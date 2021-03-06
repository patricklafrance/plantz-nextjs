import { ApiErrorBoundary, ApiErrorBoundaryFallbackProps, buildUrl } from "@core/api/http";
import {
    Box,
    Button,
    Divider,
    Grid,
    HStack,
    IconButton,
    Link,
    Stack,
    StyleProps,
    Tag,
    TagLabel,
    TagLeftIcon,
    Text,
    useBreakpointValue,
    useColorModeValue
} from "@chakra-ui/react";
import { CSSProperties, FunctionComponent, ReactNode, useCallback, useMemo, useRef } from "react";
import { CheckIcon, TimeIcon, ViewIcon } from "@chakra-ui/icons";
import { DuePlantModel, LocationValuesAndLabels, WateringTypeValuesAndLabels } from "./models";
import { Error, NoResults, ShortDivider } from "@components";
import { PlantInfoModal, PlantInfoViewMode, PlantInfoViewModes } from "./PlantInfoModal";
import { RiLeafLine, RiThumbUpLine } from "react-icons/ri";
import { UserIdContext, useContextUserId } from "@core/auth";
import { prefetchPlant, useDuePlants, useResetWatering } from "./http";

import { Icon } from "@chakra-ui/react";
import { default as NextLink } from "next/link";
import { PageMarginBottom } from "@layouts";
import { TodayRoute } from "@routes";
import { getPrettyWateringFrequency } from "./getPrettyWateringFrequency";
import { toFormattedWateringDate } from "./wateringDate";
import { transparentize } from "@chakra-ui/theme-tools";
import { useIsInViewport } from "@hooks";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";

export interface TodayViewProps {
    userId: string;
}

interface ViewLinkProps {
    children: ReactNode;
    plantId: string;
}

function ViewLink({ children, plantId }: ViewLinkProps) {
    const href = buildUrl(TodayRoute, {
        action: "view",
        id: plantId,
        viewMode: PlantInfoViewModes.preview
    });

    return (
        <NextLink
            href={href}
            as={`${TodayRoute}/${PlantInfoViewModes.preview}/${plantId}`}
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
    const userId = useContextUserId();

    const queryClient = useQueryClient();

    const handleMouseEnter = useCallback(() => prefetchPlant(queryClient, userId, plantId), [plantId, queryClient, userId]);

    return (
        <ViewLink plantId={plantId}>
            <Link
                fontSize="lg"
                onMouseEnter={handleMouseEnter}
            >
                {name}
            </Link>
        </ViewLink>
    );
}

interface ViewButtonForDeviceProps {
    onPrefetch: () => void;
    plantId: string;
}

function DesktopViewButton({ onPrefetch, plantId }: ViewButtonForDeviceProps) {
    return (
        <ViewLink plantId={plantId}>
            <IconButton
                as="a"
                icon={<ViewIcon />}
                aria-label="View plant info"
                size="lg"
                isRound
                title="View plant info"
                onMouseEnter={onPrefetch}
            />
        </ViewLink>
    );
}

function MobileViewButton({ onPrefetch, plantId }: ViewButtonForDeviceProps) {
    const ref = useRef(null);

    useIsInViewport(ref, onPrefetch);

    return (
        <ViewLink plantId={plantId}>
            <Button
                as="a"
                leftIcon={<ViewIcon />}
                aria-label="View plant info"
                title="View plant info"
                ref={ref}
            >
                View
            </Button>
        </ViewLink>
    );
}

function useViewButtonForDevice() {
    const component = useBreakpointValue<FunctionComponent<ViewButtonForDeviceProps>>({ base: MobileViewButton, md: DesktopViewButton });

    // Fallback for SSR.
    return component ?? DesktopViewButton;
}

interface ViewButtonProps {
    plantId: string;
}

function ViewButton({ plantId }: ViewButtonProps) {
    const userId = useContextUserId();

    const queryClient = useQueryClient();

    const handlePrefetch = useCallback(() => prefetchPlant(queryClient, userId, plantId), [plantId, queryClient, userId]);

    const Component = useViewButtonForDevice();

    return (
        <Component
            plantId={plantId}
            onPrefetch={handlePrefetch}
        />
    );
}

interface ResetWateringButtonForDeviceProps {
    isLoading: boolean;
    onClick: () => void;
}

function DesktopResetWateringButton({ isLoading, onClick }: ResetWateringButtonForDeviceProps) {
    return (
        <IconButton
            icon={<CheckIcon />}
            aria-label="Mark as done"
            size="lg"
            isRound
            title="Mark as done"
            onClick={onClick}
            isLoading={isLoading}
        />
    );
}

function MobileResetWateringButton({ isLoading, onClick }: ResetWateringButtonForDeviceProps) {
    return (
        <Button
            leftIcon={<CheckIcon />}
            aria-label="Mark as done"
            title="Mark as done"
            onClick={onClick}
            isLoading={isLoading}
        >
            Done
        </Button>
    );
}

function useResetWateringButtonForDevice() {
    const component = useBreakpointValue<FunctionComponent<ResetWateringButtonForDeviceProps>>({ base: MobileResetWateringButton, md: DesktopResetWateringButton });

    // Fallback for SSR.
    return component ?? DesktopResetWateringButton;
}

interface ResetWateringButtonProps {
    plantId: string;
}

function ResetWateringButton({ plantId }: ResetWateringButtonProps) {
    const userId = useContextUserId();

    // TODO: display toaster on error.
    const { isLoading, mutate: resetWatering } = useResetWatering();

    const handleClick = useCallback(() => {
        resetWatering({
            id: plantId,
            userId
        });
    }, [plantId, resetWatering, userId]);

    const Component = useResetWateringButtonForDevice();

    return (
        <Component
            isLoading={isLoading}
            onClick={handleClick}
        />
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
                    <Text fontSize="lg">{plant.wateringQuantity}</Text>
                    <Text color="gray.400">every {getPrettyWateringFrequency(plant.wateringFrequency)}</Text>
                </Box>
                <Box gridArea="watering-type">
                    <Text fontSize="lg">{WateringTypeValuesAndLabels[plant.wateringType as keyof typeof WateringTypeValuesAndLabels]}</Text>
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
                <ResetWateringButton plantId={plant.id} />
                <ViewButton plantId={plant.id} />
            </HStack>
        </Stack>
    );
}

interface LocationDividerProps {
    label: string;
}

function LocationDivider({ label }: LocationDividerProps) {
    return (
        <Stack
            marginTop={12}
            marginBottom={4}
            marginLeft={2}
        >
            <Text
                as="div"
                color={useColorModeValue("gray.700", "gray.100")}
                fontWeight={500}
                fontSize="xl"
            >
                {label}
            </Text>
            <ShortDivider />
        </Stack>
    );
}

interface ListProps {
    userId: string;
}

function List({ userId }: ListProps) {
    const { data, isLoading } = useDuePlants(userId);

    const byLocation = useMemo(() => {
        const result = data?.reduce((acc, x: DuePlantModel) => {
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
    }, [data]);

    if (isLoading) {
        return null;
    }

    // if (!isFetching && data?.length === 0) {
    if (data?.length === 0) {
        return (
            <NoResults icon={<Icon as={RiThumbUpLine} />}>
                Congratulations! All your plants are properly watered.
            </NoResults>
        );
    }

    return (
        <>
            <Stack marginLeft={2} spacing={1}>
                <Text
                    as="div"
                    fontSize="2xl"
                >
                    These plants needs water today!
                </Text>
                <Text
                    as="div"
                    fontSize="md"
                    color="gray.400"
                >
                    Water them before they dry out.
                </Text>
            </Stack>
            {Object.keys(byLocation).map(x => (
                <Stack spacing={6} key={x}>
                    <Box>
                        <LocationDivider label={LocationValuesAndLabels[x as keyof typeof LocationValuesAndLabels]} />
                        <Stack>
                            {byLocation[x].map((y: DuePlantModel, index) => (
                                <Box key={index}>
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

export function TodayView({ userId }: TodayViewProps) {
    const router = useRouter();

    const handleCloseModal = useCallback(() => {
        router.push(TodayRoute, undefined, { shallow: true });
    }, [router]);

    return (
        <UserIdContext.Provider value={{
            userId
        }}>
            {/* Must hardcode the marginBottom from PageLayout again otherwise it not's applied when the bottom is reached. */}
            <Box marginBottom={PageMarginBottom} height="100%">
                <ApiErrorBoundary fallbackRender={({ error, resetErrorBoundary }: ApiErrorBoundaryFallbackProps) => (
                    <Error
                        message="We currently cannot load plants, please try again in a few seconds."
                        detail={error.message}
                        onTryAgain={resetErrorBoundary}
                    />
                )}>
                    <List userId={userId} />
                </ApiErrorBoundary>
                <PlantInfoModal
                    allowEdit={false}
                    initialViewMode={router.query.viewMode as PlantInfoViewMode}
                    isOpen={router.query.action === "view"}
                    onClose={handleCloseModal}
                    plantId={router.query.id as string}
                />
            </Box>
        </UserIdContext.Provider>
    );
}
