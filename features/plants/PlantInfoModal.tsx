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
    Checkbox,
    Flex,
    FormControl,
    FormErrorMessage,
    FormLabel,
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
    Tag,
    TagLabel,
    TagLeftIcon,
    Text,
    Textarea,
    Tooltip,
    useBreakpointValue,
    useColorModeValue
} from "@chakra-ui/react";
import { DeleteIcon, EditIcon, LinkIcon, QuestionIcon, TimeIcon, ViewIcon } from "@chakra-ui/icons";
import { EditPlantModel, LocationValuesAndLabels, LuminosityValuesAndLabels, PlantModel, WateringFrequencyValuesAndLabels, WateringTypeValuesAndLabels, editPlantValidationSchema } from "./models";
import { RiCalendarLine, RiDropLine, RiLeafLine, RiShowersLine, RiSunLine } from "react-icons/ri";
import { SyntheticEvent, useCallback, useRef, useState } from "react";
import { getErrorMessage, isValid } from "@core/validation";
import { useEventEmitter, useEventSubcriber } from "@core/events";
import { useFetchSinglePlant, useUpdatePlant } from "./http";

import { Formik } from "formik";
import { PlantListUrl } from "@routes";
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

interface CardProps {
    icon: any;
    title: string;
    value?: string
}

function Card({ icon, title, value }: CardProps) {
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
                <Icon as={icon} boxSize={8} gridArea="icon" />
            </Flex>
            <Flex
                width={{ sm: "70%" }}
                alignItems="center"
                justifyContent="start"
            >
                <Box>
                    <Text
                        as="span"
                        gridArea="title"
                        fontWeight="500"
                        fontSize="sm"
                        textTransform="uppercase"
                    >
                        {title}
                    </Text>
                    <br />
                    <Text as="span" gridArea="value">{value}</Text>
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

function CopyLinkButton() {
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
                leftIcon={<LinkIcon />}
                onClick={handleClick}
            >
                Copy Link
            </Button>
            <NotImplemented isOpen={isOpen} onOk={handleOk} />
        </>
    );
}

interface DeleteButtonProps {
    isDisabled?: boolean;
}

function DeleteButton({ isDisabled }: DeleteButtonProps) {
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

interface PlantInfoProps {
    plant?: PlantModel;
}

function PlantInfo({ plant }: PlantInfoProps) {
    const emit = useEventEmitter();

    const handleEdit = useCallback(() => {
        emit(PlantInfoViewModeChangedEvent, { viewMode: PlantInfoViewModes.edit });
    }, [emit]);

    return (
        <>
            <ButtonGroup marginBottom={8} spacing={2}>
                <Button
                    leftIcon={<EditIcon />}
                    onClick={handleEdit}
                    autoFocus
                >
                    Edit
                </Button>
                <CopyLinkButton />
                <DeleteButton />
            </ButtonGroup>
            <Box>
                <Tag
                    as="div"
                    colorScheme="pink"
                    size="lg"
                >
                    <TagLeftIcon as={TimeIcon} />
                    <TagLabel>Due date</TagLabel>
                </Tag>
            </Box>
            {plant?.description && (
                <>
                    <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Description</Heading>
                    <Box>{plant?.description}</Box>
                </>
            )}
            <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Location</Heading>
            <Box textTransform="capitalize">{LocationValuesAndLabels[plant?.location as keyof typeof LocationValuesAndLabels]}</Box>
            {plant?.soilType && (
                <>
                    <Heading as="h4" size="small" marginTop={8} marginBottom={2}>Soil</Heading>
                    <Box textTransform="capitalize">{plant?.soilType}</Box>
                </>
            )}
            <Heading as="h4" size="small" marginTop={8} marginBottom={4}>Plant care</Heading>
            <SimpleGrid columns={{ base: 1, sm: 2 }} spacing={4} width={{ base: "100%", sm: "75%" }}>
                <Card
                    icon={RiCalendarLine}
                    title="Frequency"
                    value={WateringFrequencyValuesAndLabels[plant?.wateringFrequency as keyof typeof WateringFrequencyValuesAndLabels]}
                />
                <Card
                    icon={RiSunLine}
                    title="Light"
                    value={LuminosityValuesAndLabels[plant?.luminosity as keyof typeof LuminosityValuesAndLabels]}
                />
                <Card
                    icon={RiDropLine}
                    title="Water"
                    value={plant?.wateringQuantity as string}
                />
                <Card
                    icon={RiShowersLine}
                    title="Watering type"
                    value={WateringTypeValuesAndLabels[plant?.wateringType as keyof typeof WateringTypeValuesAndLabels]}
                />
                {plant?.mistLeaves && (
                    <Card
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
            colorScheme="teal"
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
    const emit = useEventEmitter();

    const { data, error, isError, isLoading, mutateAsync: updatePlant } = useUpdatePlant();

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
                    id: plant?._id ?? "",
                    location: plant?.location ?? "",
                    luminosity: plant?.luminosity ?? "medium",
                    mistLeaves: plant?.mistLeaves ?? false,
                    name: plant?.name ?? "",
                    soilType: plant?.soilType ?? "",
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
        <ButtonGroup spacing={6}>
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
    initialViewMode?: PlantInfoViewMode;
    onClose: () => void;
    plantId: string;
}

function _Modal({
    initialViewMode = PlantInfoViewModes.preview,
    onClose,
    plantId
}: _ModalProps) {
    const router = useRouter();

    const [viewMode, setViewMode] = useState(initialViewMode);

    const [isSaving, setIsSaving] = useState(false);

    const { data: plant } = useFetchSinglePlant(plantId);

    useEventSubcriber(PlantInfoViewModeChangedEvent, ({ viewMode }: PlantInfoViewModeChangedData) => {
        setViewMode(viewMode);

        const url = buildUrl(PlantListUrl, {
            ...preserveListQueryParameters(router.query),
            action: "view",
            id: plantId,
            viewMode
        });

        const as = buildUrl(`${PlantListUrl}/${viewMode}/${plantId}`, preserveListQueryParameters(router.query));

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
                            <PlantInfo plant={plant as PlantModel}/>
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
                initialViewMode={initialViewMode}
                onClose={onClose}
                plantId={plantId}
            />
        </Modal>
    );
}
