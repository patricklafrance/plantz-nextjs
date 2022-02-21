import { isNil, isNilOrEmpty, useComplexDependency } from "@core/utils";

import { useMemo } from "react";

export function toUrlSearchParams(params?: Record<string, any>) {
    if (isNil(params)) {
        return "";
    }

    const instance = new URLSearchParams();

    Object.keys(params).forEach(key => {
        const value = params[key];

        if (Array.isArray(value)) {
            value.forEach((arrayValue, index) => {
                if (!isNilOrEmpty(arrayValue)) {
                    instance.append(`${key}[${index}]`, arrayValue);
                }
            });
        } else {
            if (!isNilOrEmpty(value)) {
                instance.append(key, value);
            }
        }
    });

    return instance.toString();
}

export function buildUrl(url: string, params?: Record<string, any> | URLSearchParams) {
    const searchParams = params instanceof URLSearchParams ? params.toString() : toUrlSearchParams(params);

    return isNilOrEmpty(searchParams)
        ? url
        : `${url}?${searchParams}`;
}

export function useUrl(url: string, params?: Record<string, any>) {
    const _params = useComplexDependency(params);

    return useMemo(() => {
        return buildUrl(url, _params as Record<string, any>);
    }, [url, _params]);
}
