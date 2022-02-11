import { AddPlantModel, LuminosityValuesAndLabels, WateringFrequencyValuesAndLabels, WateringTypeValuesAndLabels, addPlantValidationSchema } from "./models";
import {
    Alert,
    AlertDescription,
    AlertIcon,
    Box,
    Button,
    ButtonGroup,
    Checkbox,
    FormControl,
    FormErrorMessage,
    FormLabel,
    Heading,
    Input,
    Modal,
    ModalBody,
    ModalCloseButton,
    ModalContent,
    ModalFooter,
    ModalHeader,
    ModalOverlay,
    Select,
    Stack,
    Textarea,
    Tooltip,
    useBreakpointValue
} from "@chakra-ui/react";
import { SyntheticEvent, useCallback } from "react";
import { getErrorMessage, isValid } from "@core/validation";

import { Formik } from "formik";
import { PlantAddedEvent } from "./events";
import { QuestionIcon } from "@chakra-ui/icons";
import { isNil } from "@core/utils";
import { useAddPlant } from "./http";
import { useEventEmitter } from "@core/events";

export interface AddPlantModalProps {
    isOpen: boolean;
    onClose: () => void;
};

interface _ModalProps {
    onClose: () => void;
}

function _Modal({ onClose }: _ModalProps) {
    const emit = useEventEmitter();

    const { error, isError, isLoading, mutateAsync: addPlant } = useAddPlant();

    const handleSubmit = useCallback(async (values: AddPlantModel) => {
        try {
            const response = await addPlant(values);

            emit(PlantAddedEvent, { id: response?.data?.insertedId });
            onClose();
        } catch (error: unknown) {
            // Mute uncaught error message...
        }
    }, [addPlant, emit, onClose]);

    return (
        <>
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>
                    <Heading as="h3" size="lg">Add plant</Heading>
                </ModalHeader>
                <ModalCloseButton isDisabled={isLoading} />
                <ModalBody>
                    <Formik
                        initialValues={{
                            description: "",
                            family: "Araceae",
                            location: "bedroom",
                            luminosity: "medium",
                            mistLeaves: false,
                            name: "Philodendron cordatum",
                            soilType: "",
                            wateringFrequency: "1-week",
                            wateringQuantity: "100ml",
                            wateringType: "surface"
                        }}
                        onSubmit={handleSubmit}
                        validationSchema={addPlantValidationSchema}
                    >
                        {formikState => {
                            const { getFieldProps, submitForm } = formikState;

                            return (
                                <form
                                    id="add-plant-form"
                                    onSubmit={(event: SyntheticEvent) => {
                                        event.preventDefault();
                                        submitForm();
                                    }}
                                >
                                    <Stack direction={{ base: "column", sm: "row" }} alignItems="start" spacing={4}>
                                        <FormControl isInvalid={isValid("name", formikState)} isRequired>
                                            <FormLabel htmlFor="name">Name</FormLabel>
                                            <Input
                                                {...getFieldProps("name")}
                                                placeholder="Ex. Philodendron cordatum"
                                                autoFocus
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
                                            <option value="bathroom-main-floor">Bathroom (main floor)</option>
                                            <option value="bathroom-basement">Bathroom (basement)</option>
                                            <option value="basement-front">Basement (front)</option>
                                            <option value="basement-back">Basement (back)</option>
                                            <option value="bedroom">Bedroom</option>
                                            <option value="dining-room">Dining room</option>
                                            <option value="kitchen">Kitchen</option>
                                            <option value="living-room">Living room</option>
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
                                        <FormLabel htmlFor="soil-type">Soil type</FormLabel>
                                        <Input
                                            {...getFieldProps("soil-type")}
                                            placeholder="Ex. sand, silt, or clay"
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
                                            <FormControl isInvalid={isValid("wateringFrequency", formikState)} width={{ base: "100%", sm: "40%" }} maxWidth={{ base: "100%", sm: "200px" }}>
                                                <FormLabel htmlFor="wateringFrequency">Frequency</FormLabel>
                                                <Select {...getFieldProps("wateringFrequency")}>
                                                    <option value=""></option>
                                                    {Object.keys(WateringFrequencyValuesAndLabels).map(x => (
                                                        <option value={x} key={x}>{WateringFrequencyValuesAndLabels[x as keyof typeof WateringFrequencyValuesAndLabels]}</option>
                                                    ))}
                                                </Select>
                                                <FormErrorMessage>{getErrorMessage("wateringFrequency", formikState)}</FormErrorMessage>
                                            </FormControl>
                                            <FormControl isInvalid={isValid("wateringQuantity", formikState)} maxWidth={{ base: "100%", sm: "200px" }}>
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
                                    {isError && (
                                        <Alert status="error" marginTop={6}>
                                            <AlertIcon />
                                            <AlertDescription>
                                                {!isNil(error?.validationErrors) ? error?.validationErrors.map(x => x.message) : "An error occured while adding the plant, please try again."}
                                            </AlertDescription>
                                        </Alert>
                                    )}
                                </form>
                            );
                        }}
                    </Formik>
                </ModalBody>
                <ModalFooter>
                    <ButtonGroup spacing={6}>
                        <Button
                            variant="outline"
                            onClick={close}
                            isDisabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            form="add-plant-form"
                            isLoading={isLoading}
                            type="submit"
                            variant="solid"
                            colorScheme="teal"
                        >
                            Add
                        </Button>
                    </ButtonGroup>
                </ModalFooter>
            </ModalContent>
        </>
    );
}

export function AddPlantModal({
    isOpen,
    onClose
}: AddPlantModalProps) {
    const size = useBreakpointValue({ base: "full", md: "2xl" });

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            size={size}
        >
            <_Modal onClose={onClose} />
        </Modal>
    );
}
