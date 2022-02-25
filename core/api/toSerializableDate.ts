// https://github.com/vercel/next.js/discussions/11498
export function toSerializableDate(date: Date) {
    return date.toJSON();
}
