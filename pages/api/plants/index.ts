import * as Yup from "yup";

import { AddPlantModel, EditPlantModel, PlantModel, addPlantValidationSchema, editPlantValidationSchema, getNextWateringDate } from "@features/plants";
import { ApiCommandResponse, ApiGetResponse, IdentityData, toSerializableId } from "@core/api";
import { NextApiRequest, NextApiResponse } from "next";
import { PlantDocument, PlantsCollectionName, toPlantModel } from "@features/plants/server";
import { apiHandler, withBodyValidation, withQueryValidation } from "@core/api/handlers/server";
import { executeMongoDb, queryMongoDb } from "@core/mongoDb/server";

import { Nullable } from "@core/types";
import { ObjectId } from "mongodb";
import { isNil } from "@core/utils";

const getQueryValidationSchema = Yup.object({
    userId: Yup.string().required()
});

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<Nullable<PlantModel>>>) {
    const { id, userId } = req.query;

    const plant = await queryMongoDb(database => {
        return database
            .collection(PlantsCollectionName)
            .findOne({
                _id: new ObjectId(id as string),
                userId: new ObjectId(userId as string)
            }) as Promise<Nullable<PlantDocument>>;
    });

    if (isNil(plant)) {
        res.status(404).end();
    } else {
        res.status(200).json({
            data: toPlantModel(plant)
        });
    }
}

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse<IdentityData>>) {
    const { userId, ...model } = req.body as AddPlantModel;

    const { insertedId } = await executeMongoDb(database => {
        const date = new Date();

        return database.collection(PlantsCollectionName).insertOne({
            ...model,
            creationDate: date,
            lastUpdateDate: date,
            nextWateringDate: getNextWateringDate(new Date(), model.wateringFrequency),
            userId: new ObjectId(userId)
        } as PlantDocument);
    });

    res.status(200).json({
        data: {
            id: toSerializableId(insertedId)
        }
    });
}

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const { id, userId, ...model } = req.body as EditPlantModel;

    const _id = new ObjectId(id);
    const _userId = new ObjectId(userId);

    await executeMongoDb(async database => {
        const document = await database
            .collection(PlantsCollectionName)
            .findOne({
                _id: _id,
                userId: _userId
            });

        return database.collection(PlantsCollectionName).replaceOne(
            {
                _id: _id,
                userId: _userId
            },
            {
                ...document,
                ...model,
                lastUpdateDate: new Date(),
                userId: _userId
            } as PlantDocument
        );
    });

    res.status(200).end();
}

async function handleDelete(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const { id, userId } = req.body;

    const result = await executeMongoDb(database => {
        return database
            .collection(PlantsCollectionName)
            .deleteOne({
                _id: new ObjectId(id),
                userId: new ObjectId(userId)
            });
    });

    if (result.deletedCount === 1) {
        res.status(200).end();
    } else {
        res.status(404).end();
    }
}

export default apiHandler({
    delete: handleDelete,
    get: withQueryValidation(handleGet, getQueryValidationSchema),
    post: withBodyValidation(handlePost, addPlantValidationSchema),
    put: withBodyValidation(handlePut, editPlantValidationSchema)
});
