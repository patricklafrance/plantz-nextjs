import { NextApiRequest, NextApiResponse } from "next";
import { PlantModel, searchPlantsValidationSchema } from "@features/plants";
import { apiHandler, withModelValidation } from "@core/api/handlers/server";

import { ApiGetResponse } from "@core/api";
import { searchPlants } from "@features/plants/server";

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<PlantModel[]>>) {
    const { query } = req.query;

    const plants = await searchPlants(query as string);

    res.status(200).json({
        data: plants
    });
}

export default apiHandler({
    get: withModelValidation(handleGet, searchPlantsValidationSchema)
});
