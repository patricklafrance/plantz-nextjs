import { QueryKey, useQueryClient } from "react-query";
import { UseDeleteOptions, useDelete } from "./useDelete";
import { isNil, useComplexDependency } from "@core/utils";

import { Nullable } from "@core/types";
import { useCallback } from "react";

export type UseOptimisticDeleteOptions<TVariables> = Omit<UseDeleteOptions<TVariables>, "invalidateKeys">;

export interface CacheUpdater<TVariables, TFetchModel> {
    fetchKey: string;
    updater: (variables: TVariables, data: Nullable<TFetchModel[]>) => Nullable<TFetchModel[]>;
}

export function useOptimisticDelete<TVariables, TFetchModel>(
    url: string,
    cacheUpdaters: CacheUpdater<TVariables, TFetchModel>[],
    { onError, onMutate, ...options }: UseOptimisticDeleteOptions<TVariables> = {}
) {
    const queryClient = useQueryClient();

    const _cacheUpdaters = useComplexDependency(cacheUpdaters);

    const handleMutate = useCallback(async (variables: TVariables) => {
        if (!isNil(onMutate)) {
            onMutate(variables);
        }

        const previousEntries: [QueryKey, Nullable<TFetchModel[]>][] = [];

        Promise.all(_cacheUpdaters.map(async x => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            // According to the documentation it's seem to be fuzzy so it should cancel all the search queries e.g. [SearchPlantsUrl], [SearchPlantsUrl, "foo"], [SearchPlantsUrl, "bar"], ...
            await queryClient.cancelQueries(x.fetchKey);

            queryClient.getQueryCache()
                .findAll(x.fetchKey)
                .forEach(y => {
                    queryClient.setQueryData<Nullable<TFetchModel[]>>(y.queryKey, data => {
                        previousEntries.push([y.queryKey, data]);

                        return x.updater(variables, data);
                    });
                });
        }));

        // Return a context to be used by handleError if the update fail and we have to rollback.
        return { previousEntries };
    }, [_cacheUpdaters, queryClient, onMutate]);

    // Rollback the data on error.
    const handleError = useCallback((error, variables, context) => {
        const { previousEntries } = context;

        if (!isNil(onError)) {
            onError(error, variables, context);
        }

        previousEntries.forEach((x: [QueryKey, Nullable<TFetchModel[]>]) => {
            queryClient.setQueryData(x[0], x[1]);
        });
    }, [queryClient, onError]);

    return useDelete<TVariables>(url, {
        ...options,
        onError: handleError,
        onMutate: handleMutate
    });
}
