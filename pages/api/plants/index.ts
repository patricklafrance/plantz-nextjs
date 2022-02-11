import { AddPlantModel, EditPlantModel, PlantModel, addPlantValidationSchema, editPlantValidationSchema } from "@features/plants";
import { ApiDeleteResponse, ApiGetResponse, ApiPostResponse, ApiPutResponse, InsertedIdData } from "@core/api";
import { NextApiRequest, NextApiResponse } from "next";
import { PlantsCollectionName, connectToMongoDb } from "@core/mongoDb/server";
import { apiHandler, withModelValidation } from "@core/api/handlers/server";

import { Nullable } from "@core/types";
import { ObjectId } from "mongodb";
import { findPlant } from "@features/plants/server";

async function handleGetSingle(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<Nullable<PlantModel>>>) {
    const { id } = req.query;

    const plant = await findPlant(id as string);

    res.status(200).json({
        data: plant
    });
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiPostResponse<InsertedIdData>>) {
    const model = req.body as AddPlantModel;

    const { mongoDb } = await connectToMongoDb();

    const { insertedId } = await mongoDb.collection(PlantsCollectionName).insertOne({
        ...model,
        creationDate: Date.now(),
        lastUpdateDate: Date.now()
    });

    res.status(200).json({
        data: {
            insertedId: insertedId.toJSON()
        }
    });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiPutResponse>) {
    const model = req.body as EditPlantModel;

    const { mongoDb } = await connectToMongoDb();

    await mongoDb.collection(PlantsCollectionName).replaceOne(
        { _id: new ObjectId(model.id) },
        {
            ...model,
            lastUpdateDate: Date.now()
        }
    );

    res.status(200).end();
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiDeleteResponse>) {
    const { id } = req.body;

    const { mongoDb } = await connectToMongoDb();

    const result = await mongoDb
        .collection(PlantsCollectionName)
        .deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
        res.status(200).end();
    } else {
        res.status(404).end();
    }
}

export default apiHandler({
    delete: handleDelete,
    get: handleGetSingle,
    post: withModelValidation(handlePost, addPlantValidationSchema),
    put: withModelValidation(handlePut, editPlantValidationSchema)
});
