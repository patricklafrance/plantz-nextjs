import { NextApiRequest, NextApiResponse } from "next";
import { PlantSummaryModel, toPlantSummaryModel } from "@features/plants";

import { ApiGetResponse } from "@core/api";
import { apiHandler } from "@core/api/handlers/server";
import { getDuePlants } from "@features/plants/server";

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<PlantSummaryModel[]>>) {
    const results = await getDuePlants();

    res.status(200).json({
        data: results.map(x => toPlantSummaryModel(x))
    });
}

export default apiHandler({
    get: handleGet,
});
