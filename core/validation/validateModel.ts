import { AnySchema, ValidationError } from "yup";

import { ModelValidationError } from "./types";

export interface ValidateModelResult {
    errors?: ModelValidationError[];
    ok: boolean;
}

export function validateModel(model: any, validationSchema: AnySchema) {
    return new Promise<ValidateModelResult>((resolve, reject) => {
        validationSchema.validate(model, { abortEarly: false })
            .then(() => {
                resolve({ ok: true });
            })
            .catch((errors: ValidationError) => {
                resolve({
                    errors: errors.inner.map((x: ValidationError) => {
                        return {
                            field: x.path,
                            message: x.message,
                            type: x.type
                        } as ModelValidationError;
                    }),
                    ok: false
                });
            });
    });
}
