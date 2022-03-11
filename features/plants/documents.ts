import { Document, ObjectId, WithId } from "mongodb";
import { DuePlantModel, PlantListModel } from ".";
import { Luminosity, PlantModel, WateringFrequency, WateringType } from "./models";
import { toSerializableDate, toSerializableId } from "@core/api";

export const PlantsCollectionName = "plants";

export interface PlantDocument extends WithId<Document> {
    creationDate: Date;
    description?: string;
    family?: string;
    lastUpdateDate: Date;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    nextWateringDate: Date;
    soilType?: string;
    userId: ObjectId;
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
