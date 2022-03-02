import { AddPlantModel, DuePlantModel, EditPlantModel, PlantListModel, PlantModel } from "./models";
import { IdentityData, PageData } from "@core/api";
import { InfiniteData, QueryClient } from "react-query";
import { UseOptimisticDeleteOptions, prefetchSingle, updateInfiniteFetchPages, useFetchCollection, useFetchSingle, useInfiniteFetch, useOptimisticDelete, usePost, usePut } from "@core/api/http";
import { useCallback, useMemo } from "react";

export const TodayUrl = "/api/today";
export const PlantsUrl = "/api/plants";
export const FetchSinglePlantUrl = PlantsUrl;
export const SearchPlantsUrl = `${PlantsUrl}/search`;
export const ResetWateringUrl = `${PlantsUrl}/resetWatering`;

export interface UseDuePlantsOptions {
    initialData?: DuePlantModel[];
}

export function useDuePlants({ initialData }: UseDuePlantsOptions = {}) {
    return useFetchCollection(TodayUrl, {
        initialData
    });
}

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
    return useFetchSingle<PlantModel>(FetchSinglePlantUrl, id);
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
        return [TodayUrl, SearchPlantsUrl, [FetchSinglePlantUrl, variables.id]];
    }, []);

    return usePost<UseResetWateringVariables>(ResetWateringUrl, {
        invalidateKeys: getInvalidateKeys
    });
}

export function prefetchPlant(queryClient: QueryClient, id: string) {
    return prefetchSingle<PlantModel>(queryClient, FetchSinglePlantUrl, id);
}
