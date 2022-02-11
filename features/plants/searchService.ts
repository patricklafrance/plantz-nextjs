import { PlantsCollectionName, connectToMongoDb, toStringId } from "@core/mongoDb/server";

import { ObjectId } from "mongodb";
import { PlantModel } from "./models";
import { isNil } from "@core/utils";

export async function searchPlants(query?: string) {
    const { mongoDb } = await connectToMongoDb();

    const params = query
        ? {
            $text: {
                $search: query
            }
        }
        : {};

    const plants = await mongoDb
        .collection(PlantsCollectionName)
        .find(params)
        // eslint-disable-next-line sort-keys-fix/sort-keys-fix
        .sort({ name: 1, family: 1, lastUpdateDate: -1 })
        .toArray();

    return plants.map((x: any) => toStringId<PlantModel>(x));
}

export async function findPlant(id: string) {
    const { mongoDb } = await connectToMongoDb();

    const plant = await mongoDb
        .collection(PlantsCollectionName)
        .findOne({ _id: new ObjectId(id) });

    return !isNil(plant)
        ? toStringId<PlantModel>(plant)
        : plant;
}
