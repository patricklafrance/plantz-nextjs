import { isNil } from "@core/utils";
import { FetchQueryOptions, QueryClient, QueryFunctionContext } from "react-query";
import { ApiError } from "./apiError";
import { fetcher } from "./fetcher";
import { buildFetchKey } from "./useFetchKey";
import { buildUrl } from "./useUrl";

export interface PrefetchSingleOptions<TModel> extends Omit<FetchQueryOptions<TModel, ApiError, TModel>, "queryFn" | "queryKey"> {
    params?: Record<string, any>;
}

export function prefetchSingle<TModel>(queryClient: QueryClient, url: string, id: string, { params, ...options }: PrefetchSingleOptions<TModel> = {}) {
    const _params = {
        ...params,
        id
    };

    const queryKey = buildFetchKey(url, _params);

    const _url = buildUrl(url, _params);

    const _options = {
        queryFn: ({ signal }: QueryFunctionContext) => {
            // Only prefetch if cache is cold.
            const current = queryClient.getQueryData<TModel>(queryKey);

            return !isNil(current) ? Promise.resolve(current) : fetcher<TModel>(_url, signal);
        },
        queryKey,
        useErrorBoundary: true,
        ...options
    };

    return queryClient.prefetchQuery(_options);
}
