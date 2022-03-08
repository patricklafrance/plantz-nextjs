import * as Yup from "yup";

import { Luminosity, PlantDocument, WateringFrequency, WateringType } from "./documents";
import { toSerializableDate, toSerializableId } from "@core/api";

/* PLANTS */

export interface PlantModel {
    description?: string;
    family?: string;
    id: string;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    nextWateringDate: string;
    soilType?: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export function toPlantModel(document: PlantDocument) {
    return {
        ...document,
        id: toSerializableId(document._id),
        nextWateringDate: toSerializableDate(document.nextWateringDate)
    } as PlantModel;
}

export interface PlantListModel {
    family?: string;
    id: string;
    location: string;
    luminosity: Luminosity;
    name: string;
    nextWateringDate: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export function toPlantListModel(document: PlantDocument) {
    return {
        family: document.family,
        id: toSerializableId(document._id),
        location: document.location,
        luminosity: document.luminosity,
        name: document.name,
        nextWateringDate: toSerializableDate(document.nextWateringDate),
        wateringFrequency: document.wateringFrequency,
        wateringQuantity: document.wateringQuantity,
        wateringType: document.wateringType
    } as PlantListModel;
}

export interface DuePlantModel {
    family?: string;
    id: string;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    nextWateringDate: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export function toDuePlantModel(document: PlantDocument) {
    return {
        family: document.family,
        id: toSerializableId(document._id),
        location: document.location,
        luminosity: document.luminosity,
        mistLeaves: document.mistLeaves,
        name: document.name,
        nextWateringDate: toSerializableDate(document.nextWateringDate),
        wateringFrequency: document.wateringFrequency,
        wateringQuantity: document.wateringQuantity,
        wateringType: document.wateringType
    } as DuePlantModel;
}

export interface AddPlantModel {
    description?: string;
    family?: string;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    soilType?: string;
    userId: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export const addPlantValidationSchema = Yup.object({
    location: Yup.string().required("Please provide a valid location."),
    luminosity: Yup.string().required("Please provide a valid luminosity."),
    name: Yup.string().required("Please provide a valid name."),
    userId: Yup.string().required(),
    wateringFrequency: Yup.string().required("Please provide a valid watering frequency."),
    wateringQuantity: Yup.string().required("Please provide a valid watering quantity."),
    wateringType: Yup.string().required("Please provide a valid watering type.")
});

export interface EditPlantModel {
    description?: string;
    family?: string;
    id: string;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    soilType?: string;
    userId: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export const editPlantValidationSchema = Yup.object({
    id: Yup.string().required(),
    location: Yup.string().required("Please provide a valid location."),
    luminosity: Yup.string().required("Please provide a valid luminosity."),
    name: Yup.string().required("Please provide a valid name."),
    userId: Yup.string().required(),
    wateringFrequency: Yup.string().required("Please provide a valid watering frequency."),
    wateringQuantity: Yup.string().required("Please provide a valid watering quantity."),
    wateringType: Yup.string().required("Please provide a valid watering type.")
});

export interface SearchPlantsModel {
    query?: string;
}

export const searchPlantsValidationSchema = Yup.object({
    query: Yup.string().typeError("Please provide a valid search query.")
});
