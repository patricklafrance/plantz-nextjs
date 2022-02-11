import { ApiClientError, ApiClientFailureReasons, ApiClientRequest } from "./apiClient";
import { Component, FunctionComponent, ReactElement } from "react";
import { ErrorBoundary, ErrorBoundaryPropsWithRender, FallbackProps } from "react-error-boundary";

import { ModelValidationError } from "@core/validation";
import { ValueOf } from "@core/types";
import { isNil } from "@core/utils";
import { useQueryErrorResetBoundary } from "react-query";

export const ApiErrorFailureReasons = {
    ...ApiClientFailureReasons,
    validationError: "ValidationError"
} as const;

export class ApiError extends Error {
    readonly reason: ValueOf<typeof ApiErrorFailureReasons>;
    readonly status?: number;
    readonly validationErrors?: ModelValidationError[];
    readonly stack?: string;

    constructor(error?: ApiClientError, validationErrors?: ModelValidationError[], innerStack?: string) {
        super(error?.message ?? validationErrors?.join(", "));

        this.name = this.constructor.name;
        this.reason = error?.reason ?? ApiErrorFailureReasons.validationError;
        this.status = error?.status;
        this.validationErrors = validationErrors;
        this.stack = innerStack;
    }
}

export function isApiError(error?: any): error is ApiError {
    return !isNil(error) && error instanceof ApiError;
}

export interface ApiErrorBoundaryFallbackProps {
    error: ApiError;
    resetErrorBoundary: (...args: Array<unknown>) => void;
}

export interface ApiErrorBoundary extends Omit<ErrorBoundaryPropsWithRender, "fallback" | "fallbackRender" | "FallbackComponent" | "onReset"> {
    children: ReactElement;
    fallbackRender: (props: ApiErrorBoundaryFallbackProps) => ReactElement<unknown, string | FunctionComponent | typeof Component> | null;
}

export function ApiErrorBoundary({ children, fallbackRender, ...props }: ApiErrorBoundary) {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <ErrorBoundary
            {...props}
            fallbackRender={({ error, resetErrorBoundary }: FallbackProps) => {
                if (isApiError(error)) {
                    if (error.reason !== ApiClientFailureReasons.unauthorized) {
                        return fallbackRender({ error, resetErrorBoundary });
                    }
                }

                throw error;
            }}
            onReset={reset}
        >
            {children}
        </ErrorBoundary>
    );
}
