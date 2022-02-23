import { ApiGetResponse } from "@core/api";
import { ApiError } from "./apiError";
import { ApiClientError, httpGet } from "./apiClient";

export async function fetcher<TModel>(url: string, signal?: AbortSignal) {
    const response = await httpGet<ApiGetResponse<TModel>>(url, {
        signal
    });

    if (!response.ok) {
        throw new ApiError(response.error as ApiClientError);
    }

    return response.data?.data as TModel;
}
