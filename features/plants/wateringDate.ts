import { addWeeks, format, isBefore, isEqual, startOfToday } from "date-fns";

import { WateringFrequency } from "./models";
import { isNilOrEmpty } from "@core/utils";

export function isWateringDue(nextWateringDate?: string) {
    if (isNilOrEmpty(nextWateringDate)) {
        return "";
    }

    const today = startOfToday();

    const _nextWateringDate = new Date(nextWateringDate);

    return isEqual(_nextWateringDate, today) || isBefore(_nextWateringDate, today);
}

export function toFormattedWateringDate(nextWateringDate?: string) {
    if (isNilOrEmpty(nextWateringDate)) {
        return "";
    }

    return format(new Date(nextWateringDate), "d MMM yyyy");
}

function frequencyToWeeks(wateringFrequency: WateringFrequency) {
    switch (wateringFrequency) {
        case "0.5-week":
            return 0.5;
        case "1-week":
            return 1;
        case "1.5-weeks":
            return 1.5;
        case "2-weeks":
            return 2;
        case "2.5-weeks":
            return 2.5;
        case "3-weeks":
            return 3;
        case "3.5-weeks":
            return 3.5;
        case "4-weeks":
            return 4;
        default:
            return 0;
    }
}

export function getNextWateringDate(currentWateringDate: Date, wateringFrequency: WateringFrequency) {
    const weeks = frequencyToWeeks(wateringFrequency);

    return addWeeks(currentWateringDate, weeks);
}
