import { addDays, addHours, addWeeks, format, isBefore, isEqual, startOfToday } from "date-fns";
import { isNil, isNilOrEmpty, removeTimeFromDate } from "@core/utils";

import { WateringFrequency } from "./models";

export function isWateringDue(nextWateringDate?: string) {
    if (isNilOrEmpty(nextWateringDate)) {
        return "";
    }

    const today = startOfToday();

    const _nextWateringDate = new Date(nextWateringDate);

    return isEqual(_nextWateringDate, today) || isBefore(_nextWateringDate, today);
}

export function canResetWatering(nextWateringDate?: string, wateringFrequency?: WateringFrequency) {
    if (isNilOrEmpty(nextWateringDate) || isNil(wateringFrequency)) {
        return false;
    }

    const _nextWateringDate = new Date(nextWateringDate);

    return isWateringDue(nextWateringDate) || !isEqual(_nextWateringDate, getNextWateringDate(new Date(), wateringFrequency));
}

export function toFormattedWateringDate(nextWateringDate?: string) {
    if (isNilOrEmpty(nextWateringDate)) {
        return "";
    }

    return format(new Date(nextWateringDate), "d MMM yyyy");
}

function getFrequencyCalculator(wateringFrequency: WateringFrequency) {
    switch (wateringFrequency) {
        case "0.5-week":
            return (date: Date) => {
                return addDays(addHours(date, 12), 3);
            };
        case "1-week":
            return (date: Date) => {
                return addWeeks(date, 1);
            };
        case "1.5-weeks":
            return (date: Date) => {
                return addWeeks(addDays(addHours(date, 12), 3), 1);
            };
        case "2-weeks":
            return (date: Date) => {
                return addWeeks(date, 2);
            };
        case "2.5-weeks":
            return (date: Date) => {
                return addWeeks(addDays(addHours(date, 12), 3), 2);
            };
        case "3-weeks":
            return (date: Date) => {
                return addWeeks(date, 3);
            };
        case "3.5-weeks":
            return (date: Date) => {
                return addWeeks(addDays(addHours(date, 12), 3), 3);
            };
        case "4-weeks":
            return (date: Date) => {
                return addWeeks(date, 4);
            };
        default:
            return (date: Date) => {
                return date;
            };
    }
}

export function getNextWateringDate(currentDate: Date, wateringFrequency: WateringFrequency) {
    const calculator = getFrequencyCalculator(wateringFrequency);
    const newDate = calculator(currentDate);

    console.log(newDate, removeTimeFromDate(newDate), currentDate);

    return removeTimeFromDate(newDate);
}
