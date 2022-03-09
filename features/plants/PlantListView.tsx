import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Box,
    Button,
    Divider,
    Flex,
    FormControl,
    FormErrorMessage,
    Grid,
    HStack,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Link,
    Spinner,
    Stack,
    StyleProps,
    Tag,
    TagLabel,
    TagLeftIcon,
    Text,
    useBreakpointValue,
    useColorModeValue,
    useToast
} from "@chakra-ui/react";
import { ApiErrorBoundary, ApiErrorBoundaryFallbackProps, buildUrl } from "@core/api/http";
import { AutoSizer, CellMeasurer, CellMeasurerCache, Index, InfiniteLoader, ListRowProps, List as VirtualizedList, WindowScroller } from "react-virtualized";
import { CSSProperties, FunctionComponent, ReactNode, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, DeleteIcon, PlusSquareIcon, Search2Icon, SearchIcon, TimeIcon, ViewIcon } from "@chakra-ui/icons";
import { Error, NoResults, ShortDivider } from "@components";
import { LocationValuesAndLabels, WateringTypeValuesAndLabels } from "./documents";
import { NoResultsClearedEvent, PlantDeletedEvent, SearchQueryChangedData, SearchQueryChangedEvent } from "./events";
import { PlantInfoModal, PlantInfoViewMode, PlantInfoViewModes } from "./PlantInfoModal";
import { PlantListModel, SearchPlantsModel, searchPlantsValidationSchema } from "./models";
import { UserIdContext, useUserIdContext } from "@core/auth";
import { isNil, isNilOrEmpty } from "@core/utils";
import { isWateringDue, toFormattedWateringDate } from "./wateringDate";
import { prefetchPlant, useDeletePlant, useSearchPlants } from "./http";
import { useEventEmitter, useEventSubcriber } from "@core/events";

import { AddPlantModal } from "./AddPlantModal";
import { default as NextLink } from "next/link";
import { PageMarginBottom } from "@layouts";
import { PlantListRoute } from "@routes";
import { RiMapPinLine } from "react-icons/ri";
import { getPrettyWateringFrequency } from "./getPrettyWateringFrequency";
import { preserveListQueryParameters } from "./preserveListQueryParameters";
import { transparentize } from "@chakra-ui/theme-tools";
import { useFormik } from "formik";
import { useFormikState } from "@core/validation";
import { useIsInViewport } from "@hooks";
import { useQueryClient } from "react-query";
import { useRouter } from "next/router";

export interface PlantListViewProps {
    userId: string;
}

function AddPlantTrigger(props: StyleProps) {
    const router = useRouter();

    const href = buildUrl(PlantListRoute, {
        ...preserveListQueryParameters(router.query),
        action: "add"
    });

    const as = buildUrl(`${PlantListRoute}/add`, preserveListQueryParameters(router.query));

    return (
        <NextLink
            href={href}
            as={as}
            passHref
            shallow
        >
            <Button
                {...props}
                as="a"
                colorScheme="teal"
                leftIcon={<PlusSquareIcon />}
                width={{ base: "100%", sm: "auto" }}
            >
                Add a new plant
            </Button>
        </NextLink>
    );
}

interface SearchPlantsInputProps extends StyleProps {
    query?: string
}

function SearchPlantsInput({ query, ...props }: SearchPlantsInputProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const emit = useEventEmitter();

    useEventSubcriber(NoResultsClearedEvent, () => {
        inputRef.current?.focus();
    });

    const handleSubmit = useCallback((values: SearchPlantsModel) => {
        const { query } = values;

        emit(SearchQueryChangedEvent, { query: isNilOrEmpty(query) ? undefined : query });
    }, [emit]);

    const formik = useFormik<SearchPlantsModel>({
        initialValues: {
            query
        },
        onSubmit: handleSubmit,
        validationSchema: searchPlantsValidationSchema
    });

    const { getFieldProps, setFieldValue, submitForm } = formik;

    const { getErrorMessage, getValue, isValid } = useFormikState(formik);

    // Keep the field in-sync with the parent query.
    useEffect(() => {
        setFieldValue("query", query);
    }, [query, setFieldValue]);

    const reset = useCallback(() => {
        setFieldValue("query", "");
    }, [setFieldValue]);

    const handleResetButtonClick = useCallback(() => {
        reset();
        emit(SearchQueryChangedEvent, { query: undefined } as SearchQueryChangedData);
    }, [reset, emit]);

    return (
        <HStack
            {...props}
            alignItems="top"
            as="form"
            onSubmit={useCallback((event: SyntheticEvent) => {
                event.preventDefault();
                submitForm();
            }, [submitForm])}
        >
            <FormControl
                isInvalid={isValid("query")}
                alignSelf="start"
                width={{ base: "100%", md: "400px" }}
            >
                <InputGroup>
                    <Input
                        {...getFieldProps("query")}
                        autoFocus
                        placeholder="Search by plant name or family"
                        ref={inputRef}
                    />
                    {getValue("query").length > 0 && (
                        <InputRightElement>
                            <IconButton
                                icon={<CloseIcon />}
                                onClick={handleResetButtonClick}
                                isRound
                                variant="ghost"
                                size="xs"
                                aria-label="Clear search value"
                            />
                        </InputRightElement>
                    )}
                </InputGroup>
                <FormErrorMessage>{getErrorMessage("query")}</FormErrorMessage>
            </FormControl>
            <IconButton
                icon={<SearchIcon />}
                display={{ base: "none", sm: "block" }}
                aria-label="Search"
                type="submit"
                title="Search"
            />
        </HStack>
    );
}

interface ListHeaderProps {
    query?: string;
}

function ListHeader({ query = "" }: ListHeaderProps) {
    return (
        <Grid
            templateAreas={{ base: "\"add-plant\" \"search\"", md: "\"search add-plant\"" }}
            templateColumns={{ md: "1fr max-content" }}
            gap={{ base: 6, md: 12 }}
            marginBottom={7}
            marginLeft={2}
            marginRight={2}
        >
            <SearchPlantsInput query={query} gridArea="search" />
            <AddPlantTrigger gridArea="add-plant" />
        </Grid>
    );
}

interface ViewLinkProps {
    children: ReactNode;
    plantId: string;
}

function ViewLink({ children, plantId }: ViewLinkProps) {
    const router = useRouter();

    const href = buildUrl(PlantListRoute, {
        ...preserveListQueryParameters(router.query),
        action: "view",
        id: plantId,
        viewMode: PlantInfoViewModes.preview
    });

    const as = buildUrl(`${PlantListRoute}/${PlantInfoViewModes.preview}/${plantId}`, preserveListQueryParameters(router.query));

    return (
        <NextLink
            href={href}
            as={as}
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
    const userId = useUserIdContext();

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
    const userId = useUserIdContext();

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

interface DeleteButtonForDeviceProps {
    onClick: () => void;
}

function DesktopDeleteButton({ onClick }: DeleteButtonForDeviceProps) {
    return (

        <IconButton
            icon={<DeleteIcon />}
            aria-label="Delete plant"
            size="lg"
            isRound
            onClick={onClick}
            title="Delete plant"
        />
    );
}

function MobileDeleteButton({ onClick }: DeleteButtonForDeviceProps) {
    return (
        <Button
            leftIcon={<DeleteIcon />}
            aria-label="Delete plant"
            onClick={onClick}
            title="Delete plant"
        >
            Delete
        </Button>
    );
}

function useDeleteButtonForDevice() {
    const component = useBreakpointValue<FunctionComponent<DeleteButtonForDeviceProps>>({ base: MobileDeleteButton, md: DesktopDeleteButton });

    // Fallback for SSR.
    return component ?? DesktopDeleteButton;
}

interface DeleteButtonProps {
    plantId: string;
    plantName: string;
}

function DeleteButton({ plantId, plantName }: DeleteButtonProps) {
    const userId = useUserIdContext();

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    const emit = useEventEmitter();

    const toast = useToast();

    const handleSuccess = useCallback(() => {
        emit(PlantDeletedEvent, { id: plantId });
    }, [emit, plantId]);

    const handleError = useCallback(() => {
        const toastId = `plant-delete-failed-${plantId}`;

        if (!toast.isActive(toastId)) {
            toast({
                description: <Text>Cannot delete plant <Text as="em">{plantName}</Text></Text>,
                duration: 9000,
                id: toastId,
                isClosable: true,
                position: "bottom-right",
                status: "error",
                title: "Delete failed"
            });
        }
    }, [plantId, plantName, toast]);

    const { mutate: deletePlant } = useDeletePlant({
        onError: handleError,
        onSuccess: handleSuccess
    });

    const handleClick = useCallback(() => {
        setIsConfirmationOpen(true);
    }, [setIsConfirmationOpen]);

    const handleCancel = useCallback(() => {
        setIsConfirmationOpen(false);
    }, [setIsConfirmationOpen]);

    const handleConfirm = useCallback(() => {
        deletePlant({
            id: plantId,
            userId
        });

        setIsConfirmationOpen(false);
    }, [deletePlant, plantId, setIsConfirmationOpen, userId]);

    const Component = useDeleteButtonForDevice();

    return (
        <>
            <Component onClick={handleClick} />
            <AlertDialog
                isOpen={isConfirmationOpen}
                leastDestructiveRef={cancelButtonRef}
                onClose={handleCancel}
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete a plant
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            Are you sure you want to delete <Text as="em">{plantName}</Text>?
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={handleCancel} ref={cancelButtonRef}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleConfirm} marginLeft={3}>
                                Delete plant
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}

interface ListItemProps extends StyleProps {
    plant: PlantListModel;
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
                    <Tag colorScheme="gray" size="lg">
                        <TagLeftIcon as={RiMapPinLine} />
                        <TagLabel>{LocationValuesAndLabels[plant.location as keyof typeof LocationValuesAndLabels]}</TagLabel>
                    </Tag>
                    {isWateringDue(plant.nextWateringDate) && (
                        <Tag colorScheme="pink" size="lg" marginInlineStart="0 !important">
                            <TagLeftIcon as={TimeIcon} />
                            <TagLabel>{toFormattedWateringDate(plant.nextWateringDate)}</TagLabel>
                        </Tag>
                    )}
                </HStack>
            </Grid>
            <HStack spacing={4}>
                <ViewButton plantId={plant.id} />
                <DeleteButton plantId={plant.id} plantName={plant.name} />
            </HStack>
        </Stack>
    );
}

const rowMeasurementsCache = new CellMeasurerCache({
    defaultHeight: 100,
    fixedWidth: true
});

interface ListProps extends PlantListViewProps {
    query?: string;
}

function List({ query, userId }: ListProps) {
    const { data, fetchNextPage, hasNextPage, isLoading, totalCount } = useSearchPlants(userId, {
        query
    });

    const emit = useEventEmitter();

    const flatPlants = useMemo(() => data?.pages.flatMap(x => x.data) ?? [], [data?.pages]);

    // If there are more rows to be loaded then add an extra row to hold a loading indicator.
    const rowCount = useMemo(() => hasNextPage ? flatPlants.length + 1 : flatPlants.length, [hasNextPage, flatPlants]);

    // Every row is loaded except for our loading indicator row.
    const isRowLoaded = useCallback(({ index }: Index) => {
        return !hasNextPage || index < flatPlants.length;
    }, [hasNextPage, flatPlants]);

    const renderRow = useCallback(({ index, key, parent, style: style }: ListRowProps) => {
        if (!isRowLoaded({ index })) {
            return (
                <Flex justifyContent="center" style={style} key={key}>
                    <Spinner />
                </Flex>
            );
        }

        const plant = flatPlants[index];

        let markup: ReactNode;

        let type: "item-with-divider" | "item";

        if (index + 1 !== totalCount) {
            type = "item-with-divider";

            markup = (
                <Box id={`container-${index}`} style={style}>
                    <ListItem plant={plant} />
                    <Divider id={`divider-${index}`} marginTop={2} marginBottom={2} />
                </Box>
            );
        } else {
            type = "item";

            markup = (
                <ListItem plant={plant} style={style} />
            );
        }

        return (
            <CellMeasurer
                cache={rowMeasurementsCache}
                columnIndex={0}
                rowIndex={index}
                parent={parent}
                // Since the items have a dynamic height this make sure we don't get the wrong height if an item change position.
                keyMapper={(x: number) => `${type}-${x}`}
                key={key}
            >
                {markup}
            </CellMeasurer>
        );
    }, [flatPlants, isRowLoaded, totalCount]);

    const handleLoadMore = useCallback(() => {
        return fetchNextPage();
    }, [fetchNextPage]);

    const handleClearNoResults = useCallback(() => {
        emit(SearchQueryChangedEvent, { query: undefined });
        emit(NoResultsClearedEvent);
    }, [emit]);

    if (isLoading) {
        return null;
    }

    // if (!isFetchingNextPage && data?.pages[0]?.data.length === 0) {
    if (data?.pages[0]?.data.length === 0) {
        return (
            <NoResults
                icon={<Search2Icon />}
                onClear={!isNil(query) ? handleClearNoResults : undefined}
            >
                No plants match your search criteria, please try again.
            </NoResults>
        );
    }

    return (
        // Must hardcode the marginBottom from PageLayout again otherwise it not's applied when the bottom of the list is reached.
        <Box marginBottom={PageMarginBottom}>
            <Text
                as="div"
                fontSize="lg"
                fontWeight={500}
                marginLeft={2}
            >
                Found {totalCount} plants...
            </Text>
            <ShortDivider marginLeft={2} marginBottom={3} />
            {/* "serverHeight" doesn't seems to do anything. */}
            <WindowScroller serverHeight={800} serverWidth={800}>
                {({ height, isScrolling, onChildScroll, scrollTop }) => (
                    <AutoSizer disableHeight>
                        {({ width }) => (
                            <InfiniteLoader
                                isRowLoaded={isRowLoaded}
                                rowCount={rowCount}
                                loadMoreRows={handleLoadMore}
                            >
                                {({ onRowsRendered, registerChild }) => (
                                    <VirtualizedList
                                        height={height}
                                        // Without "autoHeight", initially the list will be hidden because of a weird inline overflow style.
                                        autoHeight
                                        width={width}
                                        rowHeight={rowMeasurementsCache.rowHeight}
                                        rowCount={rowCount}
                                        rowRenderer={renderRow}
                                        isScrolling={isScrolling}
                                        scrollTop={scrollTop}
                                        onRowsRendered={onRowsRendered}
                                        onScroll={onChildScroll}
                                        deferredMeasurementCache={rowMeasurementsCache}
                                        ref={registerChild}
                                    />
                                )}
                            </InfiniteLoader>
                        )}
                    </AutoSizer>
                )}
            </WindowScroller>
        </Box>
    );
}

export function PlantListView({ userId }: PlantListViewProps) {
    const router = useRouter();

    const [query, setQuery] = useState(router.query.query as string | undefined);

    useEventSubcriber(SearchQueryChangedEvent, ({ query: newQuery }: SearchQueryChangedData) => {
        setQuery(newQuery);

        const url = buildUrl(PlantListRoute, {
            ...preserveListQueryParameters(router.query),
            query: newQuery
        });

        router.push(url, undefined, { shallow: true });
    });

    const handleCloseModal = useCallback(() => {
        const url = buildUrl(PlantListRoute, preserveListQueryParameters(router.query));

        router.push(url, undefined, { shallow: true });
    }, [router]);

    return (
        <UserIdContext.Provider value={{
            userId
        }}>
            <Flex direction="column" height="100%">
                <ListHeader query={query} />
                <ApiErrorBoundary fallbackRender={({ error, resetErrorBoundary }: ApiErrorBoundaryFallbackProps) => (
                    <Error
                        message="We currently cannot load plants, please try again in a few seconds."
                        detail={error.message}
                        onTryAgain={resetErrorBoundary}
                    />
                )}>
                    <List query={query} userId={userId} />
                </ApiErrorBoundary>
                <AddPlantModal
                    isOpen={router.query.action === "add"}
                    onClose={handleCloseModal}
                />
                <PlantInfoModal
                    initialViewMode={router.query.viewMode as PlantInfoViewMode}
                    isOpen={router.query.action === "view"}
                    onClose={handleCloseModal}
                    plantId={router.query.id as string}
                />
            </Flex>
        </UserIdContext.Provider>
    );
}
