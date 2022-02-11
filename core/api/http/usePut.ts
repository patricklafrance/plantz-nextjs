import { UseCommandOptions, UseCommandResult, useCommand } from "./useCommand";

import { ApiPutResponse } from "@core/api";

export type UsePutOptions<TVariables> = UseCommandOptions<TVariables, ApiPutResponse>;

export type UsePutResult<TVariables> = UseCommandResult<TVariables, ApiPutResponse>;

export function usePut<TVariables>(url: string, options: UsePutOptions<TVariables>) {
    return useCommand<TVariables, ApiPutResponse>(url, "PUT", options);
}
