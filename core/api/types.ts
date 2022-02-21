import { ModelValidationError } from "@core/validation";

export interface ApiGetResponse<T> {
    data?: T;
}

export interface ApiCommandResponse<T = unknown> {
    data?: T;
    validationErrors?: ModelValidationError[];
}

export interface PageData<T> {
    data: T;
    nextPage: number | null;
    previousPage: number | null;
    totalCount: number;
}

export interface IdentityData {
    id: string;
}
