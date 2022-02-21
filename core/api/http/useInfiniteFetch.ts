import { ApiClientError, httpGet } from "./apiClient";
import { ApiGetResponse, PageData } from "@core/api";
import { InfiniteData, QueryFunctionContext, UseInfiniteQueryOptions, UseInfiniteQueryResult, useInfiniteQuery } from "react-query";
import { isNil, useComplexDependency } from "@core/utils";

import { ApiError } from "./apiError";
import { buildUrl } from "./useUrl";
import { useCallback } from "react";
import { useFetchKey } from "./useFetch";

export interface UseInfiniteFetchOptions<TModel> extends
    Omit<UseInfiniteQueryOptions<TModel, ApiError, TModel>, "getNextPageParam" | "getPreviousPageParam" | "queryFn" | "queryKey" | "useErrorBoundary"> {
        params?: Record<string, any>;
    }

export type UseInfiniteFetchResult<TModel> = UseInfiniteQueryResult<TModel, ApiError> & {
    totalCount: number;
};

export function useInfiniteFetch<TModel>(url: string, { initialData, params, ...options }: UseInfiniteFetchOptions<PageData<TModel>> = {}) {
    const _params = useComplexDependency(params);

    const queryKey = useFetchKey(url, _params);

    const handleQuery = useCallback(async ({ pageParam = 1, signal }: QueryFunctionContext) => {
        const _url = buildUrl(url, {
            ..._params,
            page: pageParam
        });

        const response = await httpGet<ApiGetResponse<PageData<TModel>>>(_url, {
            signal
        });

        if (!response.ok) {
            throw new ApiError(response.error as ApiClientError);
        }

        const data = response.data?.data as PageData<TModel>;

        return data as PageData<TModel>;
    }, [_params, url]);

    const _options = {
        getNextPageParam: useCallback((lastPage: PageData<TModel>) => !isNil(lastPage.nextPage) ? lastPage.nextPage : false, []),
        getPreviousPageParam: useCallback((lastPage: PageData<TModel>) => !isNil(lastPage.previousPage) ? lastPage.previousPage : false, []),
        // initialData: _initialData,
        initialData,
        queryFn: handleQuery,
        queryKey,
        useErrorBoundary: true,
        ...options
    };

    const result = useInfiniteQuery(_options);

    return {
        ...result,
        totalCount: result.data?.pages?.[0].totalCount ?? 0
    } as UseInfiniteFetchResult<PageData<TModel>>;
}

export interface UpdatedPageData<T> {
    data: T;
    totalCount: number;
}

export function updateInfiniteFetchPages<T>(data: InfiniteData<PageData<T>>, onPage: (data: T, totalCount: number) => UpdatedPageData<T>) {
    const newPages = data?.pages.map((x: PageData<T>) => {
        const result = onPage(x.data, x.totalCount);

        return {
            ...x,
            data: result.data,
            totalCount: result.totalCount
        };
    }) ?? [];

    return {
        pageParams: data.pageParams,
        pages: newPages
    };
}

