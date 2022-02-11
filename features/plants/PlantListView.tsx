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
    FormControl,
    FormErrorMessage,
    Grid,
    HStack,
    Heading,
    IconButton,
    Input,
    InputGroup,
    InputRightElement,
    Link,
    Stack,
    StyleProps,
    Tag,
    TagLabel,
    TagLeftIcon,
    Text,
    useColorModeValue,
    useToast
} from "@chakra-ui/react";
import { ApiErrorBoundary, ApiErrorBoundaryFallbackProps, buildUrl } from "@core/api/http";
import { CloseIcon, DeleteIcon, PlusSquareIcon, SearchIcon, TimeIcon, ViewIcon } from "@chakra-ui/icons";
import { Error, NoResults } from "@components";
import { NoResultsClearedEvent, PlantDeletedEvent, SearchQueryChangedData, SearchQueryChangedEvent } from "./events";
import { PlantInfoModal, PlantInfoViewMode, PlantInfoViewModes } from "./PlantInfoModal";
import { PlantModel, SearchPlantsModel, WateringTypeValuesAndLabels, searchPlantsValidationSchema } from "./models";
import { ReactNode, SyntheticEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useDeletePlant, useSearchPlants } from "./http";
import { useEventEmitter, useEventSubcriber } from "@core/events";

import { AddPlantModal } from "./AddPlantModal";
import { default as NextLink } from "next/link";
import { PlantListUrl } from "@routes";
import { RiLeafLine } from "react-icons/ri";
import { isNilOrEmpty } from "@core/utils";
import { preserveListQueryParameters } from "./preserveListQueryParameters";
import { transparentize } from "@chakra-ui/theme-tools";
import { useFormik } from "formik";
import { useFormikState } from "@core/validation";
import { useRouter } from "next/router";

export interface PlantListViewProps {
    plants: PlantModel[];
    query?: string;
}

function prettyWaterFrequency(wateringFrequency: string) {
    /* eslint-disable indent */
    switch (wateringFrequency) {
        case "1-week":
            return "week";
        case "4-weeks":
            return "month";
        default:
            return WateringTypeValuesAndLabels[wateringFrequency as keyof typeof WateringTypeValuesAndLabels];
    }
    /* eslint-enable indent */
}

function AddPlantTrigger(props: StyleProps) {
    const router = useRouter();

    const href = buildUrl(PlantListUrl, {
        ...preserveListQueryParameters(router.query),
        action: "add"
    });

    const as = buildUrl(`${PlantListUrl}/add`, preserveListQueryParameters(router.query));

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
                width={{ base: "100%", sm: "400px" }}
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
            templateAreas={{ base: "\"add-plant\" \"search\"", lg: "\"search add-plant\"" }}
            templateColumns={{ lg: "1fr max-content" }}
            gap={{ base: 6, lg: 12 }}
            marginBottom={10}
        >
            <SearchPlantsInput query={query} gridArea="search" />
            <AddPlantTrigger gridArea="add-plant" />
        </Grid>
    );
}

interface ViewLinkProps {
    children: ReactNode;
    plant: PlantModel
}

function ViewLink({ children, plant }: ViewLinkProps) {
    const router = useRouter();

    const { _id } = plant;

    const href = buildUrl(PlantListUrl, {
        ...preserveListQueryParameters(router.query),
        action: "view",
        id: plant._id,
        viewMode: PlantInfoViewModes.preview
    });

    const as = buildUrl(`${PlantListUrl}/${PlantInfoViewModes.preview}/${_id}`, preserveListQueryParameters(router.query));

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

interface ViewButtonProps {
    plant: PlantModel
}

function ViewButton({ plant }: ViewButtonProps) {
    const router = useRouter();

    const { _id } = plant;

    const href = buildUrl(PlantListUrl, {
        ...preserveListQueryParameters(router.query),
        action: "view",
        id: plant._id,
        viewMode: PlantInfoViewModes.preview
    });

    const as = buildUrl(`${PlantListUrl}/${PlantInfoViewModes.preview}/${_id}`, preserveListQueryParameters(router.query));

    return (
        <ViewLink plant={plant}>
            <IconButton
                as="a"
                icon={<ViewIcon />}
                aria-label="View plant info"
                size="lg"
                isRound
                title="View plant info"
            />
        </ViewLink>
    );
}

interface DeleteButtonProps {
    plant: PlantModel;
}

function DeleteButton({ plant }: DeleteButtonProps) {
    const { _id, name } = plant;

    const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);

    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    const emit = useEventEmitter();

    const toast = useToast();

    const handleSuccess = useCallback(() => {
        emit(PlantDeletedEvent, { id: _id });
    }, [emit, _id]);

    const handleError = useCallback(() => {
        const toastId = `plant-delete-failed-${_id}`;

        if (!toast.isActive(toastId)) {
            toast({
                description: <Text>Cannot delete plant <Text as="em">{name}</Text></Text>,
                duration: 9000,
                id: toastId,
                isClosable: true,
                position: "bottom-right",
                status: "error",
                title: "Delete failed"
            });
        }
    }, [_id, name, toast]);

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
        deletePlant({ id: _id });
        setIsConfirmationOpen(false);
    }, [deletePlant,  _id, setIsConfirmationOpen]);

    return (
        <>
            <IconButton
                icon={<DeleteIcon />}
                aria-label="Delete plant"
                size="lg"
                isRound
                onClick={handleClick}
                title="Delete plant"
            />
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
                            Are you sure you want to delete <Text as="em">{name}</Text>?
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
    plant: PlantModel
}

function ListItem({ plant, ...rest }: ListItemProps) {
    return (
        <Stack
            {...rest}
            direction={{ base: "column", sm: "row" }}
            spacing={{ base: 6, lg: 12 }}
            paddingTop={4}
            paddingBottom={4}
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
                    <ViewLink plant={plant}>
                        <Link fontSize="lg" fontWeight="500">{plant.name}</Link>
                    </ViewLink>
                    <Text color="gray.400">{plant.family}</Text>
                </Box>
                <Box gridArea="watering-qty">
                    <Text fontSize="lg" fontWeight="500">{plant.wateringQuantity}</Text>
                    <Text color="gray.400">every {prettyWaterFrequency(plant.wateringFrequency)}</Text>
                </Box>
                <Box gridArea="watering-type">
                    <Text fontSize="lg" fontWeight="500">{WateringTypeValuesAndLabels[plant.wateringType]}</Text>
                    <Text color="gray.400">watering</Text>
                </Box>
                <HStack gridArea="tags" spacing={4}>
                    {plant.mistLeaves && (
                        <Tag colorScheme="green" size="lg">
                            <TagLeftIcon as={RiLeafLine} />
                            <TagLabel>Mist leaves</TagLabel>
                        </Tag>
                    )}
                    <Tag colorScheme="pink" size="lg">
                        <TagLeftIcon as={TimeIcon} />
                        <TagLabel>Due date</TagLabel>
                    </Tag>
                </HStack>
            </Grid>
            <HStack spacing={{ base: 6, sm: 4 }}>
                <ViewButton plant={plant} />
                <DeleteButton plant={plant} />
            </HStack>
        </Stack>
    );
}

interface ListProps {
    plants: PlantModel[];
    query?: string;
}

function List({ plants, query }: ListProps) {
    const { data: items } = useSearchPlants({ initialData: plants, query });

    const emit = useEventEmitter();

    const byLocation = useMemo(() => {
        const result = items?.reduce((acc, x: PlantModel) => {
            if (acc[x.location]) {
                acc[x.location].push(x);
            } else {
                acc[x.location] = [x];
            }

            return acc;
        }, {} as Record<string, PlantModel[]>) ?? {};

        return Object.keys(result).sort().reduce((acc, x: string) => {
            acc[x] = result[x];

            return acc;
        }, {} as Record<string, PlantModel[]>);
    }, [items]);

    const handleClearNoResults = useCallback(() => {
        emit(SearchQueryChangedEvent, { query: undefined });
        emit(NoResultsClearedEvent);
    }, [emit]);

    if (items?.length === 0) {
        return (
            <NoResults onClear={handleClearNoResults}>
                No plants match your search criteria, please try again.
            </NoResults>
        );
    }

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
                            {byLocation[x].map((y: PlantModel, index) => (
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

export function PlantListView({ plants = [], query: initialQuery }: PlantListViewProps) {
    const router = useRouter();

    const [query, setQuery] = useState(initialQuery);

    // Keep the query in sync with the url search param.
    useEffect(() => {
        setQuery(initialQuery);
    }, [initialQuery]);

    useEventSubcriber(SearchQueryChangedEvent, ({ query: newQuery }: SearchQueryChangedData) => {
        const url = buildUrl(PlantListUrl, {
            ...preserveListQueryParameters(router.query),
            query: newQuery
        });

        // Will rehydrate the page with the data returned by the page "getServerSideProps".
        // To prevent rehydrating, use "shallow".
        router.push(url);
    });

    const handleCloseModal = useCallback(() => {
        const url = buildUrl(PlantListUrl, preserveListQueryParameters(router.query));

        router.push(url, undefined, { shallow: true });
    }, [router]);

    return (
        <>
            <ListHeader query={query} />
            <ApiErrorBoundary fallbackRender={({ error, resetErrorBoundary }: ApiErrorBoundaryFallbackProps) => (
                <Error
                    message="We currently cannot load plants, please try again in a few seconds."
                    detail={error.message}
                    onTryAgain={resetErrorBoundary}
                />
            )}>
                <List plants={plants} query={query} />
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
        </>
    );
}
