import { ApiClientError, ApiClientFailureReasons, HttpMethod, httpCommand } from "./apiClient";
import { ApiError, isApiError } from "./apiError";
import { QueryKey, UseMutationOptions, UseMutationResult, useMutation, useQueryClient } from "react-query";

import { ApiCommandResponse } from "@core/api";
import { Nullable } from "@core/types";
import { isNil } from "@core/utils";
import { useCallback } from "react";

export type InvalidateKeysFunction<TVariables> = (variables: TVariables) => QueryKey[];

export interface UseCommandOptions<TVariables, TData = unknown> extends
    Omit<UseMutationOptions<TData, Nullable<ApiError>, TVariables, unknown>, "mutationFn" | "mutationKey" | "useErrorBoundary"> {
        invalidateKeys?: QueryKey[] | InvalidateKeysFunction<TVariables>;
    };

export type UseCommandResult<TVariables, TData = unknown> = UseMutationResult<TData, Nullable<ApiError>, TVariables, unknown>;

function useCommand<TVariables, TData = unknown>(url: string, method: Omit<HttpMethod, "GET">, { invalidateKeys, onSuccess, ...options }: UseCommandOptions<TVariables, TData> = {}) {
    const queryClient = useQueryClient();

    const handleMutation = useCallback(async (variables: TVariables) => {
        const httpResponse = await httpCommand<ApiCommandResponse>(url, method, variables);

        if (!httpResponse.ok) {
            throw new ApiError(httpResponse.error as ApiClientError);
        }

        const response = httpResponse.data;

        if (!isNil(response) && !isNil(response.validationErrors)) {
            throw new ApiError(undefined, response.validationErrors);
        }

        return response?.data as TData;
    }, [method, url]);

    const handleSuccess = useCallback((data, variables, context) => {
        const promises: Promise<void>[] = [];

        if (!isNil(onSuccess)) {
            const result = onSuccess(data, variables, context);

            if (!isNil(result)) {
                promises.push(result as Promise<void>);
            }
        }

        const queryKeys = Array.isArray(invalidateKeys)
            ? invalidateKeys
            : (invalidateKeys as InvalidateKeysFunction<TVariables>)(variables);

        if (!Array.isArray(queryKeys)) {
            throw "\"invalidateKeys\" function must return an array of fetch keys.";
        }

        console.log(queryKeys);

        queryKeys.forEach(x => {
            promises.push(queryClient.invalidateQueries(x));
        });

        return Promise.all(promises);
    }, [invalidateKeys, queryClient, onSuccess]);

    const _options = {
        mutationFn: handleMutation,
        mutationKey: url,
        onSuccess: !isNil(invalidateKeys) ? handleSuccess : onSuccess,
        retry: 1,
        useErrorBoundary: (error: any) => isApiError(error) && error.reason === ApiClientFailureReasons.unauthorized,
        ...options
    };

    return useMutation(_options) as UseCommandResult<TVariables, TData>;
}

export function usePost<TVariables, TData = unknown>(url: string, options?: UseCommandOptions<TVariables, TData>) {
    return useCommand<TVariables, TData>(url, "POST", options);
}

export function usePut<TVariables, TData = unknown>(url: string, options?: UseCommandOptions<TVariables, TData>) {
    return useCommand<TVariables, TData>(url, "PUT", options);
}

export function useDelete<TVariables, TData = unknown>(url: string, options?: UseCommandOptions<TVariables, TData>) {
    return useCommand<TVariables, TData>(url, "DELETE", options);
}


