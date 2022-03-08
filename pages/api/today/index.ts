import * as Yup from "yup";

import { DuePlantModel, toDuePlantModel } from "@features/plants";
import { NextApiRequest, NextApiResponse } from "next";
import { apiHandler, withQueryValidation } from "@core/api/handlers/server";

import { ApiGetResponse } from "@core/api";
import { getDuePlants } from "@features/plants/server";

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<DuePlantModel[]>>) {
    const { userId } = req.query;

    const results = await getDuePlants(userId as string);

    res.status(200).json({
        data: results.map(x => toDuePlantModel(x))
    });
}

const todayQueryValidationSchema = Yup.object({
    userId: Yup.string().required()
});

export default apiHandler({
    get: withQueryValidation(handleGet, todayQueryValidationSchema),
});
