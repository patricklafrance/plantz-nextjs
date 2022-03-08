import { AddPlantModel, DuePlantModel, EditPlantModel, PlantListModel, PlantModel } from "./models";
import { UseOptimisticDeleteOptions, prefetchSingle, updateInfiniteFetchPages, useFetchCollection, useFetchSingle, useInfiniteFetch, useOptimisticDelete, usePost, usePut } from "@core/api/http";
import { useCallback, useMemo } from "react";

import { IdentityData } from "@core/api";
import { QueryClient } from "react-query";

export const TodayUrl = "/api/today";

export const PlantsUrl = "/api/plants";

export const FetchSinglePlantUrl = PlantsUrl;

export const SearchPlantsUrl = `${PlantsUrl}/search`;

export const ResetWateringUrl = `${PlantsUrl}/resetWatering`;

export function useDuePlants(userId: string) {
    return useFetchCollection<DuePlantModel[]>(TodayUrl, {
        params: { userId }
    });
}

export interface UseSearchPlantsOptions {
    query?: string;
}

export function useSearchPlants(userId: string, { query }: UseSearchPlantsOptions = {}) {
    return useInfiniteFetch<PlantListModel[]>(SearchPlantsUrl, {
        params: { query: query ?? "", userId }
        // https://react-query.tanstack.com/guides/initial-query-data
        // https://github.com/tannerlinsley/react-query/discussions/1685#discussioncomment-2191280
        // staleTime: 5000
    });
}

export function useFetchPlant(userId: string, id: string) {
    return useFetchSingle<PlantModel>(FetchSinglePlantUrl, id, {
        params: { userId }
    });
}

export function useAddPlant() {
    return usePost<AddPlantModel, IdentityData>(PlantsUrl, {
        invalidateKeys: useMemo(() => [SearchPlantsUrl], [])
    });
}

export function useUpdatePlant() {
    const getInvalidateKeys = useCallback((variables: EditPlantModel) => {
        console.log([SearchPlantsUrl, [FetchSinglePlantUrl, variables.id, variables.userId]]);

        return [SearchPlantsUrl, [FetchSinglePlantUrl, variables.id, variables.userId]];
    }, []);

    return usePut<EditPlantModel>(PlantsUrl, {
        invalidateKeys: getInvalidateKeys
    });
}

export interface UseDeletePlantVariables {
    id: string;
    userId: string;
}

export function useDeletePlant(options: UseOptimisticDeleteOptions<UseDeletePlantVariables>) {
    const cacheUpdaters = [{
        fetchKey: SearchPlantsUrl,
        updater: useCallback(({ id }: UseDeletePlantVariables, data) => {
            return updateInfiniteFetchPages<PlantListModel[]>(data, (pageData, totalCount) => ({
                data: pageData.filter((y: any) => y.id !== id),
                totalCount: totalCount - 1
            }));
        }, [])
    }];

    // TODO: fix typing with cache update
    // @ts-ignore
    return useOptimisticDelete<UseDeletePlantVariables, PlantListModel[]>(PlantsUrl, cacheUpdaters, options);
}

export interface UseResetWateringVariables {
    id: string;
    userId: string;
}

export function useResetWatering() {
    const getInvalidateKeys = useCallback((variables: UseResetWateringVariables) => {
        return [TodayUrl, SearchPlantsUrl, [FetchSinglePlantUrl, variables.id, variables.userId]];
    }, []);

    return usePost<UseResetWateringVariables>(ResetWateringUrl, {
        invalidateKeys: getInvalidateKeys
    });
}

export function prefetchPlant(queryClient: QueryClient, userId: string, id: string) {
    return prefetchSingle<PlantModel>(queryClient, FetchSinglePlantUrl, id, {
        params: { userId }
    });
}
