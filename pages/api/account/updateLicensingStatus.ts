import * as Yup from "yup";

import { NextApiRequest, NextApiResponse } from "next";
import { UserDocument, UsersCollectionName } from "@features/account/documents";

import { ApiCommandResponse } from "@core/api";
import { ObjectId } from "mongodb";
import { UpdateLicensingStatusModel } from "@features/account";
import { apiHandler } from "@core/api/handlers/apiHandler";
import { executeMongoDb } from "@core/mongoDb/server";
import { withBodyValidation } from "@core/api/handlers/server";

async function handlePut(req: NextApiRequest, res: NextApiResponse<ApiCommandResponse>) {
    const { userId, ...model } = req.body as UpdateLicensingStatusModel;

    const _userId = new ObjectId(userId);

    await executeMongoDb(async database => {
        const document = await database
            .collection(UsersCollectionName)
            .findOne({
                _id: _userId
            });

        return database.collection(UsersCollectionName).replaceOne(
            {
                _id: _userId
            },
            {
                ...document,
                ...model,
            } as UserDocument
        );
    });

    res.status(200).end();
}

export const validationSchema = Yup.object({
    licensingStatus: Yup.string().required(),
    userId: Yup.string().required()
});

export default apiHandler({
    put: withBodyValidation(handlePut, validationSchema)
});
