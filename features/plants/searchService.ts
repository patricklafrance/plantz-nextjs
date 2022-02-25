import { PlantDocument } from "./documents";
import { PlantsCollectionName } from "@features/plants/server";
import { queryMongoDb } from "@core/mongoDb/server";

export const SearchPlantsPageSize = 50;

export interface SearchPlantsOptions {
    query?: string;
}

export interface SearchPlantsResult {
    results: PlantDocument[];
    totalCount: number;
}

export function searchPlants(page: number = 1, { query }: SearchPlantsOptions = {}) {
    const params = query
        ? {
            $text: {
                $search: query
            }
        }
        : {};

    return queryMongoDb(async database => {
        const count = await database
            .collection(PlantsCollectionName)
            .countDocuments(params);

        const documents = await database
            .collection(PlantsCollectionName)
            .find(params)
            .limit(SearchPlantsPageSize)
            .skip((page - 1) * SearchPlantsPageSize)
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            .sort({ location: 1, name: 1, family: 1, lastUpdateDate: -1 })
            .toArray();

        return {
            results: documents as PlantDocument[],
            totalCount: count
        } as SearchPlantsResult;
    });
}
