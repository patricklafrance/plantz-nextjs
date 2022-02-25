import * as Yup from "yup";

import { ApiGetResponse, PageData } from "@core/api";
import { NextApiRequest, NextApiResponse } from "next";
import { PlantSummaryModel, toPlantSummaryModel } from "@features/plants";
import { SearchPlantsPageSize, searchPlants } from "@features/plants/server";
import { apiHandler, withQueryValidation } from "@core/api/handlers/server";

interface SearchPlantsQuery {
    page: string;
    query?: string;
}

const searchPlantsQueryValidationSchema = Yup.object({
    page: Yup.number().required(),
    query: Yup.string()
});

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<PageData<PlantSummaryModel[]>>>) {
    const { page, query } = (req.query as unknown) as SearchPlantsQuery;

    const _page = parseInt(page);

    const { results, totalCount } = await searchPlants(_page, { query });

    res.status(200).json({
        data: {
            data: results.map(x => toPlantSummaryModel(x)),
            nextPage: totalCount > SearchPlantsPageSize * _page ? _page + 1 : null,
            previousPage: _page > 1 ? _page - 1 : null,
            totalCount
        }
    });
}

export default apiHandler({
    get: withQueryValidation(handleGet, searchPlantsQueryValidationSchema)
});
