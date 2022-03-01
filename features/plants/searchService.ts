import { PlantDocument } from "./documents";
import { PlantsCollectionName } from "@features/plants/server";
import { queryMongoDb } from "@core/mongoDb/server";
import { startOfToday } from "date-fns";

export const PageSize = 20;

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
            .limit(PageSize)
            .skip((page - 1) * PageSize)
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            .sort({ name: 1, family: 1, lastUpdateDate: -1 })
            .toArray();

        return {
            results: documents as PlantDocument[],
            totalCount: count
        } as SearchPlantsResult;
    });
}

export function getDuePlants() {
    return queryMongoDb(async database => {
        const today = startOfToday();

        return database
            .collection<PlantDocument>(PlantsCollectionName)
            .find({
                nextWateringDate: { $lte: today }
            })
            .limit(PageSize)
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            .sort({ location: 1, nextWateringDate: 1, name: 1, family: 1, lastUpdateDate: -1 })
            .toArray() as Promise<PlantDocument[]>;
    });
}
