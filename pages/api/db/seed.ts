import * as Yup from "yup";

import { GenerateFakeDataModel, createIndexes, generateFakeData, seedData } from "@features/db";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler, withBodyValidation } from "@core/api/handlers/server";

import { executeMongoDb } from "@core/mongoDb/server";

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
    try {
        const { fake = false, pageCount = "10", userId } = req.body as GenerateFakeDataModel;

        await executeMongoDb(async database => {
            console.log("Starting seed...");

            if (fake) {
                await generateFakeData(database, userId as string, parseInt(pageCount as string));
            } else {
                await seedData(database, userId as string);
            }

            await createIndexes(database);

            console.log("Seed completed...");

            res.status(200).end();
        });
    } catch(error: any) {
        res.status(500).json({
            error: error
        });
    }
}

const validationSchema = Yup.object({
    fake: Yup.boolean(),
    pageCount: Yup.number(),
    userId: Yup.string().required()
});

export default apiHandler({
    post: withBodyValidation(handlePost, validationSchema)
});
