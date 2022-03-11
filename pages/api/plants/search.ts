import * as Yup from "yup";

import { ApiGetResponse, PageData } from "@core/api";
import { NextApiRequest, NextApiResponse } from "next";
import { PageSize, searchPlants, toPlantListModel } from "@features/plants/server";
import { apiHandler, withQueryValidation } from "@core/api/handlers/server";

import { PlantListModel } from "@features/plants";

interface SearchPlantsQuery {
    page: string;
    query?: string;
    userId: string;
}

const searchPlantsQueryValidationSchema = Yup.object({
    page: Yup.number().required(),
    query: Yup.string(),
    userId: Yup.string().required()
});

async function handleGet(req: NextApiRequest, res: NextApiResponse<ApiGetResponse<PageData<PlantListModel[]>>>) {
    const { page, query, userId } = (req.query as unknown) as SearchPlantsQuery;

    const _page = parseInt(page);

    const { results, totalCount } = await searchPlants(userId, _page, { query });

    res.status(200).json({
        data: {
            data: results.map(x => toPlantListModel(x)),
            nextPage: totalCount > PageSize * _page ? _page + 1 : null,
            previousPage: _page > 1 ? _page - 1 : null,
            totalCount
        }
    });
}

export default apiHandler({
    get: withQueryValidation(handleGet, searchPlantsQueryValidationSchema)
});
