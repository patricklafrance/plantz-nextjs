import { UseCommandOptions, UseCommandResult, useCommand } from "./useCommand";

import { ApiPostResponse } from "@core/api";

export type UsePostOptions<TVariables, TResponse> = UseCommandOptions<TVariables, TResponse>;

export type UsePostResult<TVariables, TResponse> = UseCommandResult<TVariables, TResponse>;

export function usePost<TVariables, TResponse = unknown>(url: string, options: UsePostOptions<TVariables, ApiPostResponse<TResponse>>) {
    return useCommand<TVariables, ApiPostResponse<TResponse>>(url, "POST", options);
}
