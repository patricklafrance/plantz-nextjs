import { WateringFrequencyValuesAndLabels } from "./documents";

export function getPrettyWateringFrequency(wateringFrequency: string) {
    /* eslint-disable indent */
    switch (wateringFrequency) {
        case "1-week":
            return "week";
        case "4-weeks":
            return "month";
        default:
            return WateringFrequencyValuesAndLabels[wateringFrequency as keyof typeof WateringFrequencyValuesAndLabels];
    }
    /* eslint-enable indent */
}
