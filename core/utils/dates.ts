export function removeTimeFromDate(date: Date) {
    return new Date(date.toDateString());
}
