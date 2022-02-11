import { ApiClientError, httpGet } from "./apiClient";
import { QueryFunctionContext, QueryKey, UseQueryOptions, UseQueryResult, useQuery } from "react-query";
import { isNil, isNilOrEmpty, useComplexDependency } from "@core/utils";
import { useCallback, useMemo } from "react";

import { ApiError } from "./apiError";
import { ApiGetResponse } from "@core/api";
import { Nullable } from "@core/types";
import { useUrl } from "./useUrl";

export interface UseFetchOptions<TModel> extends Omit<UseQueryOptions<TModel, ApiError, TModel>, "queryFn" | "queryKey" | "useErrorBoundary"> {
    params?: Record<string, string | null | undefined>;
}

export type UseFetchResult<TModel> = UseQueryResult<TModel, ApiError>;

export function useFetchKey(url: string, params?: Record<string, Nullable<string>>) {
    const _params = useComplexDependency(params);

    return useMemo(() => {
        const values = isNil(_params)
            ? []
            : Object.values(_params).filter(x => !isNilOrEmpty(x));

        return values.length > 0
            ? [url, ...values]
            : url;
    }, [url, _params]) as QueryKey;
}

export function useFetch<TModel>(url: string, { params, ...options }: UseFetchOptions<Nullable<TModel>> = {}) {
    const queryKey = useFetchKey(url, params);

    const _url = useUrl(url, params);

    const query = useCallback(async ({ signal }: QueryFunctionContext) => {
        const response = await httpGet<ApiGetResponse<TModel>>(_url, {
            signal
        });

        if (!response.ok) {
            throw new ApiError(response.error as ApiClientError);
        }

        return response.data?.data;
    }, [_url]);

    const _options = {
        queryFn: query,
        queryKey,
        useErrorBoundary: true,
        ...options
    };

    return useQuery(_options) as UseFetchResult<Nullable<TModel>>;
}
