import { NextApiRequest, NextApiResponse } from "next";
import { UserDocument, UsersCollectionName } from "@features/account/server";

import { ApiGetResponse } from "@core/api";
import { LicensingStatus } from "@features/account";
import { Nullable } from "@core/types";
import { ObjectId } from "mongodb";
import { apiHandler } from "@core/api/handlers/server";
import { isNil } from "@core/utils";
import { queryMongoDb } from "@core/mongoDb/server";

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<LicensingStatus>>) {
    const { id } = req.query;

    const user = await queryMongoDb(database => {
        return database
            .collection(UsersCollectionName)
            .findOne({ _id: new ObjectId(id as string) }) as Promise<Nullable<UserDocument>>;
    });

    if (isNil(user)) {
        res.status(404).end();
    } else {
        // res.setHeader("Cache-Control", "maxage=120, must-revalidate");
        res.status(200).json({
            data: user.licensingStatus
        });
    }
}

export default apiHandler({
    get: handleGet
});
