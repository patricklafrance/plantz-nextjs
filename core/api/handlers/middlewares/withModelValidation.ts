import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { AnySchema } from "yup";
import { validateModel } from "@core/validation/server";

export function withModelValidation(handler: NextApiHandler, validationSchema: AnySchema) {
    return async (req: NextApiRequest, res: NextApiResponse<any>) => {
        const validationResult = await validateModel(req.body, validationSchema);

        if (validationResult.ok) {
            return handler(req, res);
        }

        res.status(500).json({
            validationErrors: validationResult.errors
        });
    };
}
