import { isNil, isNilOrEmpty } from "@core/utils";

import { ValueOf } from "@core/types";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE";

export interface HttpGetOptions extends RequestInit {
    useEtag?: boolean;
}

export interface HttpCommandOptions extends RequestInit {}

export interface ApiClientRequest {
    data?: Record<string, any>;
    options: RequestInit;
    url: string;
}

export interface ApiClientResponse<T> {
    data?: T;
    error?: ApiClientError;
    headers?: Headers;
    ok: boolean;
    status: number;
    statusText: string;
}

export const ApiClientFailureReasons = {
    badGateway: "BadGateway",
    badRequest: "BadRequest",
    concurrencyError: "ConcurrencyError",
    forbidden: "Forbidden",
    gatewayTimeout: "GatewayTimeout",
    internalServerError: "InternalServerError",
    malformedJson: "MalformedJson",
    networkError: "NetworkError",
    notFound: "NotFound",
    preconditionFailed: "PreconditionFailed",
    requestError: "RequestError",
    unauthorized: "Unauthorized",
    unsupportedContentType: "UnsupportedContentType"
} as const;

export interface ApiClientError {
    getResponseText?: () => Promise<string> | string;
    message: string;
    reason: ValueOf<typeof ApiClientFailureReasons>;
    request: ApiClientRequest;
    status?: number;
    statusText?: string;
}

const Etags = new Map<string, string>();

function ok<T>(response: Response, data?: any) {
    return {
        data,
        headers: response.headers,
        ok: true,
        status: response.status,
        statusText: response.statusText
    } as ApiClientResponse<T>;
}

function fail<T>(error: ApiClientError, response?: Response, data?: any) {
    return {
        data,
        error,
        headers: response?.headers,
        ok: false,
        status: response?.status,
        statusText: response?.statusText
    } as ApiClientResponse<T>;
}

function requestError(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "An error occurred while sending the request.",
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function badGateway(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responded with a 502 Bad Gateway.",
        reason: ApiClientFailureReasons.badGateway,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function badRequest(request: ApiClientRequest, responseTextAccessor: () => string, response: Response) {
    return {
        getResponseText: responseTextAccessor,
        message: "Server responded with a 400 Bad Request.",
        reason: ApiClientFailureReasons.badRequest,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function concurrencyError(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responded with a 409 ConcurrencyError.",
        reason: ApiClientFailureReasons.concurrencyError,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function forbidden(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responded with a 403 Forbidden Request.",
        reason: ApiClientFailureReasons.forbidden,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function gatewayTimeout(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responses with a 504 Gateway Timeout. The server was acting as a gateway or proxy and did not receive a timely response from the upstream server.",
        reason: ApiClientFailureReasons.gatewayTimeout,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function internalServerError(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responded with a 500 Internal Server Error.",
        reason: ApiClientFailureReasons.internalServerError,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function malformedJson(request: ApiClientRequest, innerError: object, responseTextAccessor: () => string) {
    return {
        getResponseText: responseTextAccessor,
        message: `Server responsed with a malformed JSON body\nError: ${innerError.toString()}.`,
        reason: ApiClientFailureReasons.malformedJson,
        request
    } as ApiClientError;
}

function networkError(request: ApiClientRequest, innerError: object) {
    return {
        message: `Couldn't reach the server\nError: ${innerError.toString()}.`,
        reason: ApiClientFailureReasons.networkError,
        request
    } as ApiClientError;
}

function unsupportedContentType(request: ApiClientRequest, contentType: string, responseTextAccessor: () => string, response: Response) {
    return {
        getResponseText: responseTextAccessor,
        message: `Server response Content-Type: "${contentType}" is not supported.`,
        reason: ApiClientFailureReasons.unsupportedContentType,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function unauthorized(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responded with a 401 Unauthorized Request.",
        reason: ApiClientFailureReasons.unauthorized,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function notFound(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responded with a 404 Not Found.",
        reason: ApiClientFailureReasons.notFound,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

function preconditionFailed(request: ApiClientRequest, response: Response) {
    return {
        getResponseText: () => response.text(),
        message: "Server responded with a 412 Precondition Failed.",
        reason: ApiClientFailureReasons.preconditionFailed,
        request,
        status: response.status,
        statusText: response.statusText
    } as ApiClientError;
}

async function getRawContent(response: Response) {
    const rawContent = (hasContent: boolean, content: string, contentType: string, isJson: boolean) => ({
        content,
        contentType,
        hasContent,
        isJson
    });

    const contentType = response.headers.get("content-type");

    if (!contentType) {
        // The server returned an empty response without the content-type and content-length headers.
        return rawContent(false, "", "", false);
    }

    const text = await response.text();

    return rawContent(!isNilOrEmpty(text), text, contentType, contentType.includes("application/json"));
}

interface JsonResult<T> {
    error?: any;
    isMalformed: boolean;
    json?: T
}

function toJson<T>(content: string) {
    const result = ({ error = {}, isMalformed = false, json = {} }) => ({ error, isMalformed, json }) as JsonResult<T>;

    try {
        return result({ isMalformed: false, json: JSON.parse(content) });
    } catch (error: any) {
        return result({ error, isMalformed: true });
    }
}

async function handleError<T>(request: ApiClientRequest, response: Response) {
    if (response.status === 400) {
        const { content, hasContent, isJson } = await getRawContent(response);

        // Doesn't need to be async since the await operator will convert it to a resolved promise if needed.
        const textAccessor = () => content;

        if (hasContent && isJson) {
            const jsonResult = toJson<T>(content);

            if (jsonResult.isMalformed) {
                return fail<T>(malformedJson(request, jsonResult.error, textAccessor), response);
            }

            return fail<T>(badRequest(request, textAccessor, response), response, jsonResult.json);
        }

        return fail<T>(badRequest(request, textAccessor, response), response);
    } else if (response.status === 401) {
        return fail<T>(unauthorized(request, response), response);
    } else if (response.status === 403) {
        return fail<T>(forbidden(request, response), response);
    } else if (response.status === 404) {
        return fail<T>(notFound(request, response), response);
    } else if (response.status === 409) {
        return fail<T>(concurrencyError(request, response), response);
    } else if (response.status === 412) {
        return fail<T>(preconditionFailed(request, response), response);
    } else if (response.status === 500) {
        return fail<T>(internalServerError(request, response), response);
    } else if (response.status === 502) {
        return fail<T>(badGateway(request, response), response);
    } else if (response.status === 504) {
        return fail<T>(gatewayTimeout(request, response), response);
    }

    // The status code is not currently handled.
    return fail<T>(requestError(request, response), response);
}

async function execute<T>(request: ApiClientRequest) {
    try {
        const { options, url } = request;

        const response = await fetch(url, options);

        if (response.ok) {
            // A 304 not modified could be returned if Etags are used.
            if (response.status === 304) {
                return ok<T>(response);
            }

            const { content, contentType, hasContent, isJson } = await getRawContent(response);

            // Doesn't need to be async since the await operator will convert it to a resolved promise if needed.
            const textAccessor = () => content;

            if (hasContent && content !== "OK") {
                if (isJson) {
                    const jsonResult = toJson(content);

                    if (jsonResult.isMalformed) {
                        return fail<T>(malformedJson(request, jsonResult.error, textAccessor), response);
                    }

                    return ok<T>(response, jsonResult.json);
                } else {
                    return fail<T>(unsupportedContentType(request, contentType, textAccessor, response), response);
                }
            }

            return ok<T>(response);
        } else {
            return await handleError<T>(request, response);
        }
    } catch (error: any) {
        return fail<T>(networkError(request, error));
    }
}

function createRequestOptions(method: HttpMethod, { headers = {}, ...options }: RequestInit = {}) {
    const requestHeaders: HeadersInit = {
        "Content-Type": "application/json",
        ...headers
    };

    return {
        headers: requestHeaders,
        method,
        ...options
    } as RequestInit;
}

export async function httpGet<T>(url: string, { useEtag = false, ...options }: HttpGetOptions = {}) {
    if (useEtag) {
        const etag = Etags.get(url);

        if (!isNil(etag)) {
            const { headers = {} } = options;

            options.headers = {
                "If-None-Match": etag,
                ...headers
            };
        }
    }

    const requestOptions = createRequestOptions("GET", options);

    const request = {
        options: requestOptions,
        url
    };

    const response = await execute<T>(request);

    if (useEtag) {
        if (response.ok && response.status !== 304) {
            const newEtag = response.headers?.get("ETag");

            if (newEtag) {
                Etags.set(url, newEtag);
            }
        }
    }

    return response;
}

export function httpCommand<T>(url: string, method: Omit<HttpMethod, "GET"> = "POST", data: Record<string, any>, options: HttpCommandOptions = {}) {
    const requestOptions = createRequestOptions(method as HttpMethod, {
        body: JSON.stringify(data),
        ...options
    });

    const request = {
        options: requestOptions,
        url
    };

    return execute<T>(request);
}
