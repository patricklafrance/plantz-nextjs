import { DuePlantModel, toDuePlantModel } from "@features/plants";
import { NextApiRequest, NextApiResponse } from "next";

import { ApiGetResponse } from "@core/api";
import { apiHandler } from "@core/api/handlers/server";
import { getDuePlants } from "@features/plants/server";

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<DuePlantModel[]>>) {
    const results = await getDuePlants();

    res.status(200).json({
        data: results.map(x => toDuePlantModel(x))
    });
}

export default apiHandler({
    get: handleGet,
});
