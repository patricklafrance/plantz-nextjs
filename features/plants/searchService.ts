import { PlantsCollectionName, toSerializableId, withMongoDb } from "@core/mongoDb/server";

import { PlantSummaryModel } from "./models";

export const SearchPlantsPageSize = 50;

export interface SearchPlantsOptions {
    query?: string;
}

export interface SearchPlantsResult {
    results: PlantSummaryModel[];
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

    return withMongoDb<SearchPlantsResult>(async database => {
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

        const plants =  documents.map(x => ({
            family: x.family,
            id: toSerializableId(x._id),
            location: x.location,
            luminosity: x.luminosity,
            mistLeaves: x.mistLeaves,
            name: x.name,
            wateringFrequency: x.wateringFrequency,
            wateringQuantity: x.wateringQuantity,
            wateringType: x.wateringType
        }));

        return {
            results: plants as PlantSummaryModel[],
            totalCount: count
        };
    });
}
