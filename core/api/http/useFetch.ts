import { ApiClientError, httpGet } from "./apiClient";
import { QueryFunctionContext, QueryKey, UseQueryOptions, UseQueryResult, useQuery } from "react-query";
import { isNil, isNilOrEmpty, useComplexDependency } from "@core/utils";
import { useCallback, useMemo } from "react";

import { ApiError } from "./apiError";
import { ApiGetResponse } from "@core/api";
import { Nullable } from "@core/types";
import { useUrl } from "./useUrl";

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

export interface UseFetchOptions<TModel> extends Omit<UseQueryOptions<TModel, ApiError, TModel>, "queryFn" | "queryKey" | "useErrorBoundary"> {
    params?: Record<string, any>;
}

export type UseFetchResult<TModel> = UseQueryResult<TModel, ApiError>;

export function useBaseFetch<TModel>(url: string, { params, ...options }: UseFetchOptions<TModel> = {}) {
    const queryKey = useFetchKey(url, params);

    const _url = useUrl(url, params);

    const handleQuery = useCallback(async ({ signal }: QueryFunctionContext) => {
        const response = await httpGet<ApiGetResponse<TModel>>(_url, {
            signal
        });

        if (!response.ok) {
            throw new ApiError(response.error as ApiClientError);
        }

        return response.data?.data as TModel;
    }, [_url]);

    const _options = {
        queryFn: handleQuery,
        queryKey,
        useErrorBoundary: true,
        ...options
    };

    return useQuery(_options) as UseFetchResult<TModel>;
}

export function useFetch<TModel>(url: string, options: UseFetchOptions<TModel>) {
    return useBaseFetch<TModel>(url, options);
}

export function useFetchSingle<TModel>(url: string, id: string, { params, ...options }: UseFetchOptions<Nullable<TModel>> = {}) {
    const _params = {
        ...params,
        id
    };

    return useBaseFetch<Nullable<TModel>>(url, {
        ...options,
        params: _params
    });
}
