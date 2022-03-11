import {
    Alert,
    AlertDescription,
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    AlertIcon,
    Box,
    Button,
    ButtonGroup,
    ButtonProps,
    Checkbox,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Grid,
    HStack,
    Heading,
    Icon,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    SimpleGrid,
    Stack,
    Text,
    Textarea,
    Tooltip,
    useBreakpointValue,
    useColorModeValue
} from "@chakra-ui/react";
import { CheckIcon, DeleteIcon, EditIcon, LinkIcon, QuestionIcon, TimeIcon, ViewIcon } from "@chakra-ui/icons";
import { EditPlantModel, LocationValuesAndLabels, LuminosityValuesAndLabels, PlantModel, WateringFrequencyValuesAndLabels, WateringTypeValuesAndLabels, editPlantValidationSchema } from "./models";
import { RiCalendarLine, RiDropLine, RiLeafLine, RiShowersLine, RiSunLine } from "react-icons/ri";
import { SyntheticEvent, useCallback, useRef, useState } from "react";
import { canResetWatering, isWateringDue, toFormattedWateringDate } from "./wateringDate";
import { getErrorMessage, isValid } from "@core/validation";
import { useContextUserId, useSessionUserId } from "@core/auth";
import { useEventEmitter, useEventSubcriber } from "@core/events";
import { useFetchPlant, useResetWatering, useUpdatePlant } from "./http";

import { Formik } from "formik";
import { PlantListRoute } from "@routes";
import { buildUrl } from "@core/api/http";
import { isNil } from "@core/utils";
import { preserveListQueryParameters } from "./preserveListQueryParameters";
import { useRouter } from "next/router";

export const PlantInfoViewModes = {
    edit: "edit",
    preview: "preview"
} as const;

export type PlantInfoViewMode = keyof typeof PlantInfoViewModes;

export interface PlantInfoModalProps {
    allowEdit?: boolean;
    initialViewMode?: PlantInfoViewMode;
    isOpen: boolean;
    onClose: () => void;
    plantId: string;
}

const PlantInfoViewModeChangedEvent = "PlantInfoViewModeChanged";
const PlantInfoSavingEvent = "PlantInfoSaving";
const PlantInfoSavingCompletedEvent = "PlatInfoSavingCompleted";

interface PlantInfoViewModeChangedData {
    viewMode: PlantInfoViewMode;
}

interface CareCardProps {
    icon: any;
    title: string;
    value?: string
}

function CareCard({ icon, title, value }: CareCardProps) {
    return (
        <HStack
            backgroundColor={useColorModeValue("gray.100", "whiteAlpha.300")}
            borderRadius="lg"
            padding={4}
            spacing={5}
            minHeight="80px"
        >
            <Flex
                width={{ sm: "30%" }}
                alignItems="center"
                justifyContent="center"
            >
                <Icon as={icon} boxSize={8} />
            </Flex>
            <Flex
                width={{ sm: "70%" }}
                alignItems="center"
                justifyContent="start"
            >
                <Box>
                    <Text
                        as="span"
                        fontWeight="500"
                        fontSize="sm"
                        textTransform="uppercase"
                    >
                        {title}
                    </Text>
                    <br />
                    <Text as="span">{value}</Text>
                </Box>
            </Flex>
        </HStack>
    );
}

interface NotImplentedProps {
    isOpen: boolean;
    onOk: () => void;
}

function NotImplemented({ isOpen, onOk }: NotImplentedProps) {
    const okButtonRef = useRef<HTMLButtonElement>(null);

    return (
        <AlertDialog
            isOpen={isOpen}
            leastDestructiveRef={okButtonRef}
            onClose={onOk}
        >
            <AlertDialogOverlay>
                <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                        Not Implemented
                    </AlertDialogHeader>
                    <AlertDialogBody>
                        This feature is not implemented yet.
                    </AlertDialogBody>
                    <AlertDialogFooter>
                        <Button onClick={onOk} ref={okButtonRef}>
                            Ok
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialogOverlay>
        </AlertDialog>
    );
}

function CopyLinkButton(props: ButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = useCallback(() => {
        setIsOpen(true);
    }, [setIsOpen]);

    const handleOk = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    return (
        <>
            <Button
                {...props}
                leftIcon={<LinkIcon />}
                onClick={handleClick}
            >
                Copy Link
            </Button>
            <NotImplemented isOpen={isOpen} onOk={handleOk} />
        </>
    );
}

interface DeleteButtonProps extends ButtonProps {
    isDisabled?: boolean;
}

function DeleteButton({ isDisabled, ...props }: DeleteButtonProps) {
    const [isOpen, setIsOpen] = useState(false);

    const handleClick = useCallback(() => {
        setIsOpen(true);
    }, [setIsOpen]);

    const handleOk = useCallback(() => {
        setIsOpen(false);
    }, [setIsOpen]);

    return (
        <>
            <Button
                {...props}
                leftIcon={<DeleteIcon />}
                isDisabled={isDisabled}
                onClick={handleClick}
            >
                Delete
            </Button>
            <NotImplemented isOpen={isOpen} onOk={handleOk} />
        </>
    );
}

interface WateringColorScheme {
    backgroundColor: string[],
    button: string[],
    color: string
}

const NextWateringColorSchemes: Record<string, WateringColorScheme> = {
    "is-due": {
        backgroundColor: ["red.100", "red.200"],
        button: ["whiteAlpha", "blackAlpha"],
        color: "gray.800"
    },
    "is-not-due": {
        backgroundColor: ["green.100", "green.100"],
        button: ["whiteAlpha", "blackAlpha"],
        color: "gray.800"
    }
};

interface ResetWateringButtonProps {
    colorScheme: WateringColorScheme;
    plantId?: string;
}

function ResetWateringButton({ colorScheme, plantId }: ResetWateringButtonProps) {
    const userId = useContextUserId();

    // TODO: display toaster on error.
    const { isLoading, mutate: resetWatering } = useResetWatering();

    const handleClick = useCallback(() => {
        resetWatering({
            id: plantId as string,
            userId
        });
    }, [plantId, resetWatering, userId]);

    return (
        <Button
            onClick={handleClick}
            variant="solid"
            colorScheme={useColorModeValue(colorScheme.button[0], colorScheme.button[1])}
            color={colorScheme.color}
            leftIcon={<CheckIcon />}
            isLoading={isLoading}
        >
            {useBreakpointValue({ base: "Done", sm: "Mark as done" })}
        </Button>
    );
}

interface PlantInfoProps {
    allowEdit?: boolean;
    plant?: PlantModel;
}

function PlantInfo({ allowEdit, plant }: PlantInfoProps) {
    const emit = useEventEmitter();

    const wateringDateColorScheme = NextWateringColorSchemes[isWateringDue(plant?.nextWateringDate) ? "is-due" : "is-not-due"];

    const handleEdit = useCallback(() => {
        emit(PlantInfoViewModeChangedEvent, { viewMode: PlantInfoViewModes.edit });
    }, [emit]);

    return (
        <>
            <ButtonGroup spacing={2} flexGrow={1}>
                {allowEdit && (
                    <Button
                        leftIcon={<EditIcon />}
                        onClick={handleEdit}
                        autoFocus
                    >
                        Edit
                    </Button>
                )}
                <CopyLinkButton />
                {allowEdit && (
                    <DeleteButton />
                )}
            </ButtonGroup>
            <Grid
                gridTemplateColumns={{ base: "2fr 1fr", sm: "repeat(2, minmax(0, 1fr))" }}
                backgroundColor={useColorModeValue(wateringDateColorScheme.backgroundColor[0], wateringDateColorScheme.backgroundColor[1])}
                color={wateringDateColorScheme.color}
                borderRadius="lg"
                padding={4}
                minHeight="80px"
                width={{ base: "100%", sm: "75%" }}
                marginTop={8}
                alignItems="center"
            >
                <HStack width="100%" spacing={{ base: 5, sm: 2 }}>
                    <Flex
                        width={{ sm: "30%" }}
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Icon as={TimeIcon} boxSize={8} />
                    </Flex>
                    <Flex
                        width={{ sm: "70%" }}
                        alignItems="center"
                        justifyContent="start"
                    >
                        <Box>
                            <Text
                                as="span"
                                fontWeight="500"
                                fontSize="sm"
                                textTransform="uppercase"
                            >
                                Next Watering
                            </Text>
                            <br />
                            <Text as="span">{toFormattedWateringDate(plant?.nextWateringDate)}</Text>
                        </Box>
                    </Flex>
                </HStack>
                {allowEdit && canResetWatering(plant?.nextWateringDate, plant?.wateringFrequency) && (
                    <Flex width="100%" justifyContent="center">
                        <ResetWateringButton
                            plantId={plant?.id}
                            colorScheme={wateringDateColorScheme}
                        />
                    </Flex>
                )}
            </Grid>
            {plant?.description && (
                <>
                    <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Description</Heading>
                    <Box>{plant?.description}</Box>
                </>
            )}
            <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Location</Heading>
            <Box>{LocationValuesAndLabels[plant?.location as keyof typeof LocationValuesAndLabels]}</Box>
            {plant?.soilType && (
                <>
                    <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Soil</Heading>
                    <Box textTransform="capitalize">{plant?.soilType}</Box>
                </>
            )}
            <Heading as="h4" size="small" marginTop={8} marginBottom={4}>Plant care</Heading>
            <SimpleGrid
                columns={{ base: 1, sm: 2 }}
                spacing={4}
                width={{ base: "100%", sm: "75%" }}
            >
                <CareCard
                    icon={RiCalendarLine}
                    title="Frequency"
                    value={WateringFrequencyValuesAndLabels[plant?.wateringFrequency as keyof typeof WateringFrequencyValuesAndLabels]}
                />
                <CareCard
                    icon={RiSunLine}
                    title="Light"
                    value={LuminosityValuesAndLabels[plant?.luminosity as keyof typeof LuminosityValuesAndLabels]}
                />
                <CareCard
                    icon={RiDropLine}
                    title="Water"
                    value={plant?.wateringQuantity as string}
                />
                <CareCard
                    icon={RiShowersLine}
                    title="Watering type"
                    value={WateringTypeValuesAndLabels[plant?.wateringType as keyof typeof WateringTypeValuesAndLabels]}
                />
                {plant?.mistLeaves && (
                    <CareCard
                        icon={RiLeafLine}
                        title="Mist leaves"
                    />
                )}
            </SimpleGrid>
        </>
    );
}

interface PlantInfoFooter {
    onClose: () => void;
}

function PlantInfoFooter({ onClose }: PlantInfoFooter) {
    return (
        <Button
            variant="solid"
            onClick={onClose}
        >
            Close
        </Button>
    );
}

interface EditPlantProps {
    formId: string;
    plant?: PlantModel;
}

function EditPlant({
    formId,
    plant
}: EditPlantProps) {
    const userId = useSessionUserId();

    const emit = useEventEmitter();

    const { error, isError, isLoading, mutateAsync: updatePlant } = useUpdatePlant();

    const switchToPreview = useCallback(() => {
        emit(PlantInfoViewModeChangedEvent, { viewMode: PlantInfoViewModes.preview });
    }, [emit]);

    const handleView = useCallback(() => {
        switchToPreview();
    }, [switchToPreview]);

    const handleSubmit = useCallback(async (values: EditPlantModel) => {
        try {
            emit(PlantInfoSavingEvent);

            await updatePlant(values);

            emit(PlantInfoSavingCompletedEvent);

            switchToPreview();
        } catch (error: unknown) {
            // Mute uncaught error message...
            emit(PlantInfoSavingCompletedEvent);
        }
    }, [emit, switchToPreview, updatePlant]);

    return (
        <>
            <ButtonGroup marginBottom={8} spacing={2}>
                <Button
                    leftIcon={<ViewIcon />}
                    onClick={handleView}
                    isDisabled={isLoading}
                >
                    View
                </Button>
                <CopyLinkButton />
                <DeleteButton isDisabled={isLoading} />
            </ButtonGroup>
            <Formik
                enableReinitialize
                initialValues={{
                    description: plant?.description ?? "",
                    family: plant?.family ?? "",
                    id: plant?.id ?? "",
                    location: plant?.location ?? "",
                    luminosity: plant?.luminosity ?? "medium",
                    mistLeaves: plant?.mistLeaves ?? false,
                    name: plant?.name ?? "",
                    soilType: plant?.soilType ?? "",
                    userId,
                    wateringFrequency: plant?.wateringFrequency ?? "1-week",
                    wateringQuantity: plant?.wateringQuantity ?? "",
                    wateringType: plant?.wateringType ?? "deep"
                }}
                onSubmit={handleSubmit}
                validationSchema={editPlantValidationSchema}
            >
                {formikState => {
                    const { getFieldProps, submitForm } = formikState;

                    return (
                        <>
                            <form
                                id={formId}
                                onSubmit={(event: SyntheticEvent) => {
                                    console.log("**** inline edit");

                                    event.preventDefault();
                                    submitForm();
                                }}
                            >
                                <Stack direction={{ base: "column", sm: "row" }} alignItems="start" spacing={4}>
                                    <FormControl isInvalid={isValid("name", formikState)}>
                                        <FormLabel htmlFor="name">Name</FormLabel>
                                        <Input
                                            {...getFieldProps("name")}
                                            autoFocus
                                            placeholder="Ex. Philodendron cordatum"
                                        />
                                        <FormErrorMessage>{getErrorMessage("name", formikState)}</FormErrorMessage>
                                    </FormControl>
                                    <FormControl isInvalid={isValid("family", formikState)}>
                                        <FormLabel htmlFor="family">Family</FormLabel>
                                        <Input
                                            {...getFieldProps("family")}
                                            placeholder="Ex. Araceae"
                                        />
                                    </FormControl>
                                </Stack>
                                <FormControl isInvalid={isValid("description", formikState)} marginTop={4}>
                                    <FormLabel htmlFor="description">Description</FormLabel>
                                    <Textarea {...getFieldProps("description")} />
                                    <FormErrorMessage>{getErrorMessage("description", formikState)}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={isValid("location", formikState)} width={{ base: "100%", sm: "75%" }} marginTop={4}>
                                    <FormLabel htmlFor="location">Location</FormLabel>
                                    <Select {...getFieldProps("location")}>
                                        <option value=""></option>
                                        {Object.keys(LocationValuesAndLabels).map(x => (
                                            <option value={x} key={x}>{LocationValuesAndLabels[x as keyof typeof LocationValuesAndLabels]}</option>
                                        ))}
                                    </Select>
                                    <FormErrorMessage>{getErrorMessage("location", formikState)}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={isValid("luminosity", formikState)} width={{ base: "100%", sm: "25%" }} marginTop={4}>
                                    <FormLabel htmlFor="luminosity">Luminosity</FormLabel>
                                    <Select {...getFieldProps("luminosity")}>
                                        {Object.keys(LuminosityValuesAndLabels).map(x => (
                                            <option value={x} key={x}>{LuminosityValuesAndLabels[x as keyof typeof LuminosityValuesAndLabels]}</option>
                                        ))}
                                    </Select>
                                    <FormErrorMessage>{getErrorMessage("luminosity", formikState)}</FormErrorMessage>
                                </FormControl>
                                <FormControl isInvalid={isValid("soilType", formikState)} width={{ base: "100%", sm: "75%" }} marginTop={4}>
                                    <FormLabel htmlFor="soilType">Soil type</FormLabel>
                                    <Input
                                        {...getFieldProps("soilType")}
                                        placeholder="Ex. Sand, Silt, or Clay"
                                    />
                                </FormControl>
                                <FormControl marginTop={5}>
                                    <Checkbox {...getFieldProps("mistLeaves")}>
                                    Mist leaves
                                    </Checkbox>
                                    <Tooltip label="Misting is the act of temporarily increasing the humidity around a plant by applying water in the form of tiny droplets from spray bottles or canisters. Mist should be applied both to the top and underside of plant leaves during early mornings between 7 am and 9 am and on evenings after 5pm.">
                                        <QuestionIcon color="teal.300" marginLeft={2} />
                                    </Tooltip>
                                </FormControl>
                                <Box as="fieldset" marginTop={7}>
                                    <Heading as="legend" size="md">Watering</Heading>
                                    <Stack direction={{ base: "column", sm: "row" }} alignItems="start" spacing={4} marginTop={4}>
                                        <FormControl isInvalid={isValid("wateringFrequency", formikState)} width={{ base: "100%", sm: "40%" }}>
                                            <FormLabel htmlFor="wateringFrequency">Frequency</FormLabel>
                                            <Select {...getFieldProps("wateringFrequency")}>
                                                <option value=""></option>
                                                {Object.keys(WateringFrequencyValuesAndLabels).map(x => (
                                                    <option value={x} key={x}>{WateringFrequencyValuesAndLabels[x as keyof typeof WateringFrequencyValuesAndLabels]}</option>
                                                ))}
                                            </Select>
                                            <FormErrorMessage>{getErrorMessage("wateringFrequency", formikState)}</FormErrorMessage>
                                        </FormControl>
                                        <FormControl isInvalid={isValid("wateringQuantity", formikState)} maxWidth="200px">
                                            <FormLabel htmlFor="wateringQuantity">Quantity</FormLabel>
                                            <Input
                                                {...getFieldProps("wateringQuantity")}
                                                placeholder="Ex. 2 cups"
                                            />
                                            <FormErrorMessage>{getErrorMessage("wateringQuantity", formikState)}</FormErrorMessage>
                                        </FormControl>
                                    </Stack>
                                    <FormControl isInvalid={isValid("wateringType", formikState)} marginTop={4} width={{ base: "100%", sm: "25%" }}>
                                        <FormLabel htmlFor="wateringType">Type</FormLabel>
                                        <Select {...getFieldProps("wateringType")}>
                                            {Object.keys(WateringTypeValuesAndLabels).map(x => (
                                                <option value={x} key={x}>{WateringTypeValuesAndLabels[x as keyof typeof WateringTypeValuesAndLabels]}</option>
                                            ))}
                                        </Select>
                                        <FormErrorMessage>{getErrorMessage("wateringType", formikState)}</FormErrorMessage>
                                    </FormControl>
                                </Box>
                                <input
                                    {...getFieldProps("id")}
                                    type="hidden"
                                />
                                <input
                                    {...getFieldProps("userId")}
                                    type="hidden"
                                />
                            </form>
                            {isError && (
                                <Alert status="error" marginTop={6}>
                                    <AlertIcon />
                                    <AlertDescription>
                                        {!isNil(error?.validationErrors) ? error?.validationErrors.map(x => x.message) : "An error occured while updating the plant, please try again."}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </>
                    );
                }}
            </Formik>
        </>
    );
}

interface EditPlantFooterProps {
    formId: string;
    isLoading: boolean;
}

function EditPlantFooter({
    formId,
    isLoading
}: EditPlantFooterProps) {
    const emit = useEventEmitter();

    const handleCancel = useCallback(() => {
        emit(PlantInfoViewModeChangedEvent, { viewMode: PlantInfoViewModes.preview });
    }, [emit]);

    return (
        <ButtonGroup spacing={2}>
            <Button
                variant="outline"
                onClick={handleCancel}
            >
                Cancel
            </Button>
            <Button
                form={formId}
                isLoading={isLoading}
                type="submit"
                variant="solid"
                colorScheme="teal"
            >
                Update
            </Button>
        </ButtonGroup>
    );
}

interface _ModalProps {
    allowEdit?: boolean;
    initialViewMode?: PlantInfoViewMode;
    onClose: () => void;
    plantId: string;
}

function _Modal({
    allowEdit = true,
    initialViewMode = PlantInfoViewModes.preview,
    onClose,
    plantId
}: _ModalProps) {
    const userId = useSessionUserId();

    const router = useRouter();

    const [viewMode, setViewMode] = useState(allowEdit ? initialViewMode : PlantInfoViewModes.preview);

    const [isSaving, setIsSaving] = useState(false);

    const { data: plant } = useFetchPlant(userId, plantId);

    useEventSubcriber(PlantInfoViewModeChangedEvent, ({ viewMode }: PlantInfoViewModeChangedData) => {
        setViewMode(viewMode);

        const url = buildUrl(PlantListRoute, {
            ...preserveListQueryParameters(router.query),
            action: "view",
            id: plantId,
            viewMode
        });

        const as = buildUrl(`${PlantListRoute}/${viewMode}/${plantId}`, preserveListQueryParameters(router.query));

        router.push(url, as, { shallow: true });
    });

    useEventSubcriber(PlantInfoSavingEvent, () => {
        setIsSaving(true);
    });

    useEventSubcriber(PlantInfoSavingCompletedEvent, () => {
        setIsSaving(false);
    });

    const isEditing = viewMode === PlantInfoViewModes.edit;

    return (
        <>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading as="h3" size="lg">{plant?.name}</Heading>
                    <Text as="span" fontSize="xl" color="gray.400">{plant?.family}</Text>
                </ModalHeader>
                <ModalCloseButton isDisabled={isSaving} />
                <ModalBody>
                    {isEditing
                        ? (
                            <EditPlant
                                plant={plant as PlantModel}
                                formId="edit-plant-form"
                            />
                        )
                        : (
                            <PlantInfo
                                allowEdit={allowEdit}
                                plant={plant as PlantModel}
                            />
                        )
                    }
                </ModalBody>
                <ModalFooter>
                    {isEditing
                        ? (
                            <EditPlantFooter
                                isLoading={isSaving}
                                formId="edit-plant-form"
                            />
                        )
                        : (
                            <PlantInfoFooter onClose={onClose} />
                        )
                    }
                </ModalFooter>
            </ModalContent>
        </>
    );
}

export function PlantInfoModal({
    allowEdit,
    initialViewMode,
    isOpen,
    onClose,
    plantId
}: PlantInfoModalProps) {
    const size = useBreakpointValue({ base: "full", md: "2xl" });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={size}
        >
            <_Modal
                allowEdit={allowEdit}
                initialViewMode={initialViewMode}
                onClose={onClose}
                plantId={plantId}
            />
        </Modal>
    );
}
