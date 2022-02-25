import { NextApiRequest, NextApiResponse } from "next";
import { PlantDocument, PlantsCollectionName } from "@features/plants/server";

import { ApiCommandResponse } from "@core/api";
import { ObjectId } from "mongodb";
import { apiHandler } from "@core/api/handlers/server";
import { executeMongoDb } from "@core/mongoDb/server";
import { getNextWateringDate } from "@features/plants";

async function handlePost(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const { id } = req.body;

    await executeMongoDb(async database => {
        const document = await database
            .collection(PlantsCollectionName)
            .findOne({ _id: new ObjectId(id as string) }) as PlantDocument;

        return database
            .collection(PlantsCollectionName)
            .replaceOne(
                { _id: new ObjectId(id) },
                {
                    ...document,
                    lastUpdateDate: new Date(),
                    nextWateringDate: getNextWateringDate(new Date(), document.wateringFrequency)
                } as PlantDocument
            );
    });

    res.status(200).end();
}

export default apiHandler({
    post: handlePost
});
