import { isNil, isNilOrEmpty, useComplexDependency } from "@core/utils";

import { QueryKey } from "react-query";
import { useMemo } from "react";

export function buildFetchKey(url: string, params?: Record<string, any>) {
    const values = isNil(params)
        ? []
        : Object.values(params).filter(x => !isNilOrEmpty(x));

    return values.length > 0
        ? [url, ...values]
        : url;
}

export function useFetchKey(url: string, params?: Record<string, any>) {
    const _params = useComplexDependency(params);

    return useMemo(() => buildFetchKey(url, _params), [url, _params]) as QueryKey;
}
