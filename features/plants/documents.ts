import { Document, WithId } from "mongodb";

export const PlantsCollectionName = process.env.PLANTS_COLLECTION_NAME as string;

if (!PlantsCollectionName) {
    throw new Error(
        "Please define the PLANTS_COLLECTION_NAME environment variable inside .env.local"
    );
}

export const LocationValuesAndLabels = {
    "basement-back": "Basement (Back)",
    "basement-front": "Basement (Front)",
    "bathroom-basement": "Bathroom (Basement)",
    "bathroom-main-floor": "Bathroom (Main floor)",
    "bedroom": "Bedroom",
    "dining-room": "Dining room",
    "kitchen": "Kitchen",
    "living-room": "Living room"
};

export const LuminosityValuesAndLabels = {
    "high": "High",
    "low": "Low",
    "medium": "Medium"
} as const;

export const WateringFrequencyValuesAndLabels = {
    "0.5-week": "0.5 week",
    "1.5-weeks": "1.5 weeks",
    "1-week": "1 week",
    "2.5-weeks": "2.5 weeks",
    "2-weeks": "2 weeks",
    "3.5-weeks": "3.5 weeks",
    "3-weeks": "3 weeks",
    "4-weeks": "4 weeks"
} as const;

export const WateringTypeValuesAndLabels = {
    "deep": "Deep",
    "surface": "Surface"
} as const;

export type Luminosity = keyof typeof LuminosityValuesAndLabels;

export type WateringFrequency = keyof typeof WateringFrequencyValuesAndLabels;

export type WateringType = keyof typeof WateringTypeValuesAndLabels;

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
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}
