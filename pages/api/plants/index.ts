import { AddPlantModel, EditPlantModel, PlantModel, addPlantValidationSchema, editPlantValidationSchema } from "@features/plants";
import { ApiCommandResponse, ApiGetResponse, IdentityData } from "@core/api";
import { NextApiRequest, NextApiResponse } from "next";
import { PlantsCollectionName, toSerializableModel, withMongoDb } from "@core/mongoDb/server";
import { apiHandler, withBodyValidation } from "@core/api/handlers/server";

import { Nullable } from "@core/types";
import { ObjectId } from "mongodb";
import { isNil } from "@core/utils";

async function handleGetSingle(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<Nullable<PlantModel>>>) {
    const { id } = req.query;

    const plant = await withMongoDb(database => {
        return database
            .collection(PlantsCollectionName)
            .findOne({ _id: new ObjectId(id as string) });
    });

    res.status(200).json({
        data: !isNil(plant)
            ? toSerializableModel<PlantModel>(plant)
            : plant
    });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse<IdentityData>>) {
    const model = req.body as AddPlantModel;

    const { insertedId } = await withMongoDb(database => {
        return database.collection(PlantsCollectionName).insertOne({
            ...model,
            creationDate: Date.now(),
            lastUpdateDate: Date.now()
        });
    });

    res.status(200).json({
        data: {
            id: insertedId.toJSON()
        }
    });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const model = req.body as EditPlantModel;

    await withMongoDb(database => {
        return database.collection(PlantsCollectionName).replaceOne(
            { _id: new ObjectId(model.id) },
            {
                ...model,
                lastUpdateDate: Date.now()
            }
        );
    });

    res.status(200).end();
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const { id } = req.body;

    const result = await withMongoDb(database => {
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
