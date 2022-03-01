import { AddPlantModel, EditPlantModel, PlantListModel, PlantModel } from "./models";
import { IdentityData, PageData } from "@core/api";
import { InfiniteData, QueryClient } from "react-query";
import { UseOptimisticDeleteOptions, prefetchSingle, updateInfiniteFetchPages, useFetchCollection, useInfiniteFetch, useOptimisticDelete, usePost, usePut } from "@core/api/http";
import { useCallback, useMemo } from "react";

export const SearchPlantsUrl = "/api/plants/search";
export const FetchSinglePlantUrl = "/api/plants";
export const ResetWateringUrl = "/api/plants/resetWatering";

export interface UseSearchPlantsOptions {
    initialData?: InfiniteData<PageData<PlantListModel[]>>;
    query?: string;
}

export function useSearchPlants({ initialData, query }: UseSearchPlantsOptions = {}) {
    return useInfiniteFetch<PlantListModel[]>(SearchPlantsUrl, {
        initialData,
        params: { query: query ?? "" }
        // https://react-query.tanstack.com/guides/initial-query-data
        // https://github.com/tannerlinsley/react-query/discussions/1685#discussioncomment-2191280
        // staleTime: 5000
    });
}

export function useFetchPlant(id: string) {
    return useFetchCollection<PlantModel>(FetchSinglePlantUrl, {
        params: { id }
    });
}

export function useAddPlant() {
    return usePost<AddPlantModel, IdentityData>("/api/plants", {
        invalidateKeys: useMemo(() => [SearchPlantsUrl], [])
    });
}

export function useUpdatePlant() {
    const getInvalidateKeys = useCallback((variables: EditPlantModel) => {
        return [SearchPlantsUrl, [FetchSinglePlantUrl, variables.id]];
    }, []);

    return usePut<EditPlantModel>("/api/plants", {
        invalidateKeys: getInvalidateKeys
    });
}

export interface UseDeletePlantVariables {
    id: string
}

export function useDeletePlant(options: UseOptimisticDeleteOptions<UseDeletePlantVariables>) {
    const cacheUpdaters = [{
        fetchKey: SearchPlantsUrl,
        updater: useCallback(({ id }, data) => {
            return updateInfiniteFetchPages<PlantListModel[]>(data, (pageData, totalCount) => ({
                data: pageData.filter((y: any) => y.id !== id),
                totalCount: totalCount - 1
            }));
        }, [])
    }];

    // TODO: fix typing with cache update
    // @ts-ignore
    return useOptimisticDelete<UseDeletePlantVariables, PlantListModel[]>("/api/plants", cacheUpdaters, options);
}

export interface UseResetWateringVariables {
    id: string
}

export function useResetWatering() {
    const getInvalidateKeys = useCallback((variables: UseResetWateringVariables) => {
        return [SearchPlantsUrl, [FetchSinglePlantUrl, variables.id]];
    }, []);

    return usePost<UseResetWateringVariables>(ResetWateringUrl, {
        invalidateKeys: getInvalidateKeys
    });
}

export function prefetchPlant(queryClient: QueryClient, id: string) {
    return prefetchSingle<PlantModel>(queryClient, FetchSinglePlantUrl, id);
}
