import { AddPlantModel, EditPlantModel, PlantModel, PlantSummaryModel } from "./models";
import { IdentityData, PageData } from "@core/api";
import { UseOptimisticDeleteOptions, updateInfiniteFetchPages, useFetch, useInfiniteFetch, useOptimisticDelete, usePost, usePut } from "@core/api/http";
import { useCallback, useMemo } from "react";

import { InfiniteData } from "react-query";

export const SearchPlantsUrl = "/api/plants/search";
export const FetchSinglePlantUrl = "/api/plants";

export interface UseSearchPlantsOptions {
    initialData?: InfiniteData<PageData<PlantSummaryModel[]>>;
    query?: string;
}

export function useSearchPlants({ initialData, query }: UseSearchPlantsOptions = {}) {
    return useInfiniteFetch<PlantSummaryModel[]>(SearchPlantsUrl, {
        initialData,
        params: { query: query ?? "" }
        // https://react-query.tanstack.com/guides/initial-query-data
        // staleTime: 5000
    });
}

export function useFetchSinglePlant(id: string) {
    return useFetch<PlantModel>(FetchSinglePlantUrl, {
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
            return updateInfiniteFetchPages<PlantSummaryModel[]>(data, (pageData, totalCount) => ({
                data: pageData.filter((y: any) => y.id !== id),
                totalCount: totalCount - 1
            }));
        }, [])
    }];

    // return useOptimisticDelete<UseDeletePlantVariables, InfiniteData<PageData<PlantSummaryModel[]>>>("/api/plants", cacheUpdaters, options);
    // TODO: fix typing with cache update
    return useOptimisticDelete<UseDeletePlantVariables, PlantSummaryModel[]>("/api/plants", cacheUpdaters, options);
}
