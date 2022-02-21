import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { AnySchema } from "yup";
import { validateModel } from "@core/validation/server";

function validate(getModel: (req: NextApiRequest) => any, handler: NextApiHandler, validationSchema: AnySchema) {
    return async (req: NextApiRequest, res: NextApiResponse<any>) => {
        const validationResult = await validateModel(getModel(req), validationSchema);

        if (validationResult.ok) {
            return handler(req, res);
        }

        res.status(500).json({
            validationErrors: validationResult.errors
        });
    };
}

export function withQueryValidation(handler: NextApiHandler, validationSchema: AnySchema) {
    return validate(req => req.query, handler, validationSchema);
}

export function withBodyValidation(handler: NextApiHandler, validationSchema: AnySchema) {
    return validate(req => req.body, handler, validationSchema);
}
