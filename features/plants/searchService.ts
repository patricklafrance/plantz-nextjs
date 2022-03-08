import { ObjectId } from "mongodb";
import { PlantDocument } from "./documents";
import { PlantsCollectionName } from "@features/plants/server";
import { queryMongoDb } from "@core/mongoDb/server";
import { startOfToday } from "date-fns";

export const PageSize = 15;

export interface SearchPlantsOptions {
    query?: string;
}

export interface SearchPlantsResult {
    results: PlantDocument[];
    totalCount: number;
}

export function searchPlants(userId: string, page: number = 1, { query }: SearchPlantsOptions = {}) {
    const queryParams = query
        ? {
            $text: {
                $search: query
            }
        }
        : {};

    const params = {
        userId: new ObjectId(userId),
        ...queryParams
    };

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

export function getDuePlants(userId: string) {
    return queryMongoDb(async database => {
        const today = startOfToday();

        return database
            .collection<PlantDocument>(PlantsCollectionName)
            .find({
                nextWateringDate: { $lte: today },
                userId: new ObjectId(userId)
            })
            .limit(PageSize)
            // eslint-disable-next-line sort-keys-fix/sort-keys-fix
            .sort({ location: 1, nextWateringDate: 1, name: 1, family: 1, lastUpdateDate: -1 })
            .toArray() as Promise<PlantDocument[]>;
    });
}
