import { AddPlantModel, EditPlantModel, PlantModel, addPlantValidationSchema, editPlantValidationSchema, getNextWateringDate, toPlantModel } from "@features/plants";
import { ApiCommandResponse, ApiGetResponse, IdentityData, toSerializableId } from "@core/api";
import { NextApiRequest, NextApiResponse } from "next";
import { PlantDocument, PlantsCollectionName } from "@features/plants/server";
import { apiHandler, withBodyValidation } from "@core/api/handlers/server";
import { executeMongoDb, queryMongoDb } from "@core/mongoDb/server";
import { isNil, removeTimeFromDate } from "@core/utils";

import { Nullable } from "@core/types";
import { ObjectId } from "mongodb";

async function handleGetSingle(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<Nullable<PlantModel>>>) {
    const { id } = req.query;

    const plant = await queryMongoDb(database => {
        return database
            .collection(PlantsCollectionName)
            .findOne({ _id: new ObjectId(id as string) }) as Promise<Nullable<PlantDocument>>;
    });

    res.status(200).json({
        data: !isNil(plant)
            ? toPlantModel(plant)
            : plant
    });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse<IdentityData>>) {
    const model = req.body as AddPlantModel;

    const { insertedId } = await executeMongoDb(database => {
        const date = new Date();

        return database.collection(PlantsCollectionName).insertOne({
            ...model,
            creationDate: date,
            lastUpdateDate: date,
            nextWateringDate: getNextWateringDate(removeTimeFromDate(date), model.wateringFrequency)
        });
    });

    res.status(200).json({
        data: {
            id: toSerializableId(insertedId)
        }
    });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const model = req.body as EditPlantModel;

    await executeMongoDb(async database => {
        const document = await database
            .collection(PlantsCollectionName)
            .findOne({ _id: new ObjectId(model.id as string) });

        return database.collection(PlantsCollectionName).replaceOne(
            { _id: new ObjectId(model.id) },
            {
                ...document,
                ...model,
                lastUpdateDate: new Date()
            } as PlantDocument
        );
    });

    res.status(200).end();
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const { id } = req.body;

    const result = await executeMongoDb(database => {
        return database
            .collection(PlantsCollectionName)
            .deleteOne({ _id: new ObjectId(id) });
    });

    if (result.deletedCount === 1) {
        res.status(200).end();
    } else {
        res.status(404).end();
    }
}

export default apiHandler({
    delete: handleDelete,
    get: handleGetSingle,
    post: withBodyValidation(handlePost, addPlantValidationSchema),
    put: withBodyValidation(handlePut, editPlantValidationSchema)
});
