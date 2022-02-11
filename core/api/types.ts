import { ModelValidationError } from "@core/validation";

export interface ApiGetResponse<T> {
    data?: T;
}

export interface ApiValidationErrorResponse {
    validationErrors?: ModelValidationError[];
}

export interface ApiPostResponse<T> extends ApiValidationErrorResponse {
    data?: T;
}

export type ApiPutResponse = ApiValidationErrorResponse;

export type ApiDeleteResponse = ApiValidationErrorResponse;

export interface InsertedIdData {
    insertedId: string;
}
