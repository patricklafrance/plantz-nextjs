import { QueryFunctionContext, UseQueryOptions, UseQueryResult, useQuery } from "react-query";

import { ApiError } from "./apiError";
import { Nullable } from "@core/types";
import { fetcher } from "./fetcher";
import { useCallback } from "react";
import { useFetchKey } from "./useFetchKey";
import { useUrl } from "./useUrl";

export interface UseFetchOptions<TModel> extends Omit<UseQueryOptions<TModel, ApiError, TModel>, "queryFn" | "queryKey" | "useErrorBoundary"> {
    params?: Record<string, any>;
}

export type UseFetchResult<TModel> = UseQueryResult<TModel, ApiError>;

export function useFetch<TModel>(url: string, { params, ...options }: UseFetchOptions<TModel> = {}) {
    const queryKey = useFetchKey(url, params);

    const _url = useUrl(url, params);

    const handleQuery = useCallback(({ signal }: QueryFunctionContext) => fetcher<TModel>(_url, signal), [_url]);

    const _options = {
        queryFn: handleQuery,
        queryKey,
        useErrorBoundary: true,
        ...options
    };

    return useQuery(_options);
}

export function useFetchCollection<TModel>(url: string, options?: UseFetchOptions<TModel>) {
    return useFetch<TModel>(url, options);
}

export function useFetchSingle<TModel>(url: string, id: string, { params, ...options }: UseFetchOptions<Nullable<TModel>> = {}) {
    const _params = {
        ...params,
        id
    };

    return useFetch<Nullable<TModel>>(url, {
        ...options,
        params: _params
    });
}
