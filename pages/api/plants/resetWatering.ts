import { NextApiRequest, NextApiResponse } from "next";
import { PlantDocument, PlantsCollectionName } from "@features/plants/server";

import { ApiCommandResponse } from "@core/api";
import { ObjectId } from "mongodb";
import { apiHandler } from "@core/api/handlers/server";
import { executeMongoDb } from "@core/mongoDb/server";
import { getNextWateringDate } from "@features/plants";

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const { id, userId } = req.body;

    const _id = new ObjectId(id);
    const _userId = new ObjectId(userId);

    await executeMongoDb(async database => {
        const document = await database
            .collection(PlantsCollectionName)
            .findOne({
                _id: _id,
                userId: _userId
            }) as PlantDocument;

        return database
            .collection(PlantsCollectionName)
            .replaceOne(
                {
                    _id: _id,
                    userId: _userId
                },
                {
                    ...document,
                    lastUpdateDate: new Date(),
                    nextWateringDate: getNextWateringDate(new Date(), document.wateringFrequency),
                    userId: _userId
                } as PlantDocument
            );
    });

    res.status(200).end();
}

export default apiHandler({
    post: handlePost
});
