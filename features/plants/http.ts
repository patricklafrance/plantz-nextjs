import { AddPlantModel, EditPlantModel, PlantModel } from "./models";
import { UseDeleteOptions, useFetch, useOptimisticDelete, usePost, usePut } from "@core/api/http";
import { useCallback, useMemo } from "react";

import { InsertedIdData } from "@core/api";

const SearchPlantsUrl = "/api/plants/search";
const FetchSinglePlantUrl = "/api/plants";

export interface UseSearchPlantsOptions {
    initialData?: PlantModel[],
    query?: string
}

export function useSearchPlants({ initialData, query }: UseSearchPlantsOptions = {}) {
    return useFetch<PlantModel[]>(SearchPlantsUrl, {
        initialData,
        params: { query: query ?? "" }
    });
}

export function useFetchSinglePlant(id: string) {
    return useFetch<PlantModel>(FetchSinglePlantUrl, {
        params: { id }
    });
}

export function useAddPlant() {
    return usePost<AddPlantModel, InsertedIdData>("/api/plants", {
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

export function useDeletePlant(options: UseDeleteOptions<UseDeletePlantVariables>) {
    const cacheUpdaters = [{
        fetchKey: SearchPlantsUrl,
        updater: useCallback(({ id }, data) => data?.filter((x: PlantModel) => x._id !== id), [])
    }];

    return useOptimisticDelete<UseDeletePlantVariables, PlantModel>("/api/plants", cacheUpdaters, options);
}
