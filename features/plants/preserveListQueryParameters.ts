import { ParsedUrlQuery } from "querystring";

export function preserveListQueryParameters(routerQuery: ParsedUrlQuery) {
    return {
        query: routerQuery.query
    } as Record<string, string>;
}
