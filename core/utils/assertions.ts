export function isNil(value: any): value is null | undefined {
    return value == null;
}

export function isNilOrEmpty(value?: string | null | undefined): value is null | undefined | string {
    return isNil(value) || value === "";
}
