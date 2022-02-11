import * as Yup from "yup";

export const LuminosityValuesAndLabels = {
    "high": "High",
    "low": "Low",
    "medium": "Medium"
} as const;

export const WateringFrequencyValuesAndLabels = {
    "0.5-week": "0.5 week",
    "1.5-weeks": "1.5 week",
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

export interface PlantModel {
    _id: string;
    creationDate: number;
    description?: string;
    family?: string;
    lastUpdateDate: number;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    soilType?: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export interface AddPlantModel {
    description?: string;
    family?: string;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    soilType?: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export const addPlantValidationSchema = Yup.object({
    location: Yup.string().required("Please provide a valid location."),
    luminosity: Yup.string().required("Please provide a valid luminosity."),
    name: Yup.string().required("Please provide a valid name."),
    wateringFrequency: Yup.string().required("Please provide a valid watering frequency."),
    wateringQuantity: Yup.string().required("Please provide a valid watering quantity."),
    wateringType: Yup.string().required("Please provide a valid watering type.")
});

export interface EditPlantModel {
    description?: string;
    family?: string;
    id?: string;
    location: string;
    luminosity: Luminosity;
    mistLeaves?: boolean;
    name: string;
    soilType?: string;
    wateringFrequency: WateringFrequency;
    wateringQuantity: string;
    wateringType: WateringType;
}

export const editPlantValidationSchema = Yup.object({
    id: Yup.string().required(),
    location: Yup.string().required("Please provide a valid location."),
    luminosity: Yup.string().required("Please provide a valid luminosity."),
    name: Yup.string().required("Please provide a valid name."),
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
