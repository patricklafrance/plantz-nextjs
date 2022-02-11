import { ApiClientError, ApiClientFailureReasons, HttpMethod, httpCommand } from "./apiClient";
import { ApiError, isApiError } from "./apiError";
import { QueryKey, UseMutationOptions, UseMutationResult, useMutation, useQueryClient } from "react-query";

import { ApiValidationErrorResponse } from "@core/api";
import { Nullable } from "@core/types";
import { isNil } from "@core/utils";
import { useCallback } from "react";

export type InvalidateKeysFunction<TVariables> = (variables: TVariables) => QueryKey[];

export interface UseCommandOptions<TVariables, TResponse> extends
    Omit<UseMutationOptions<Nullable<TResponse>, Nullable<ApiError>, TVariables, unknown>, "mutationFn" | "mutationKey" | "useErrorBoundary"> {
    invalidateKeys?: QueryKey[] | InvalidateKeysFunction<TVariables>;
};

export type UseCommandResult<TVariables, TResponse> = UseMutationResult<Nullable<TResponse>, Nullable<ApiError>, TVariables, unknown>;

export function useCommand<TVariables, TResponse extends ApiValidationErrorResponse>(url: string, method: Omit<HttpMethod, "GET">, { invalidateKeys, onSuccess, ...options }: UseCommandOptions<TVariables, TResponse> = {}) {
    const queryClient = useQueryClient();

    const mutate = useCallback(async (variables: TVariables) => {
        const response = await httpCommand<TResponse>(url, method, variables);

        if (!response.ok) {
            throw new ApiError(response.error as ApiClientError);
        }

        const data = response.data;

        if (!isNil(data) && !isNil(data.validationErrors)) {
            throw new ApiError(undefined, data.validationErrors);
        }

        return data;
    }, [method, url]);

    const handleSuccess = useCallback((data, variables, context) => {
        const promises: Promise<void>[] = [];

        if (!isNil(onSuccess)) {
            // @ts-ignore
            const result = onSuccess(data, variables, context);

            if (!isNil(result)) {
                promises.push(result as Promise<void>);
            }
        }

        const queryKeys = Array.isArray(invalidateKeys)
            ? invalidateKeys
            : (invalidateKeys as InvalidateKeysFunction<TVariables>)(variables);

        if (!Array.isArray(queryKeys)) {
            throw new Error("\"invalidateKeys\" function must return an array of fetch keys.");
        }

        queryKeys.forEach(x => {
            promises.push(queryClient.invalidateQueries(x));
        });

        return Promise.all(promises);
    }, [invalidateKeys, queryClient, onSuccess]);

    const _options = {
        mutationFn: mutate,
        mutationKey: url,
        onSuccess: !isNil(invalidateKeys) ? handleSuccess : onSuccess,
        retry: 1,
        useErrorBoundary: (error: any) => isApiError(error) && error.reason === ApiClientFailureReasons.unauthorized,
        ...options
    };

    return useMutation(_options) as UseCommandResult<TVariables, TResponse>;
}
