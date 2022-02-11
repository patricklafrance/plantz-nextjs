import { UseCommandOptions, UseCommandResult, useCommand } from "./useCommand";

import { ApiDeleteResponse } from "@core/api";

export type UseDeleteOptions<TVariables> = UseCommandOptions<TVariables, ApiDeleteResponse>;

export type UseDeleteResult<TVariables> = UseCommandResult<TVariables, ApiDeleteResponse>;

export function useDelete<TVariables>(url: string, options: UseDeleteOptions<TVariables>) {
    return useCommand<TVariables, ApiDeleteResponse>(url, "DELETE", options);
}
