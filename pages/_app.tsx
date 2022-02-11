import { ApiClientFailureReasons, isApiError } from "@core/api/http";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { NextRouter, withRouter } from "next/router";
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from "react-query";

import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { Component } from "react";
import { Error } from "@components";
import { NextPage } from "next";
import { PageLayout } from "@layouts";
import { isNil } from "@core/utils";

export type Page = NextPage & {
    pageTitle?: string;
}

interface AppPropsWithPageTitle extends AppProps {
    Component: Page
}

const ErrorMessage = "An error occurred, please try again in a few seconds.";

// Special error boundary since redirecting in the unmanaged error boundary results in an infinite loop.
class _UnauthorizedErrorBoundary extends Component<{ router: NextRouter }> {
    static getDerivedStateFromError() {
        return { hasError: true };
    }

    componentDidCatch(error: Error) {
        if (isApiError(error)) {
            if (error.reason === ApiClientFailureReasons.unauthorized) {
                this.props.router.push("/login");
            }
        }
    }

    render() {
        return this.props.children;
    }
}

const UnauthorizedErrorBoundary = withRouter(_UnauthorizedErrorBoundary);

function UnmanagedErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
    if (isApiError(error)) {
        if (error.reason === ApiClientFailureReasons.unauthorized) {
            throw error;
        }

        return (
            <Error
                message={ErrorMessage}
                detail={error.message}
                onTryAgain={resetErrorBoundary}
            />
        );
    }

    return (
        <Error
            message={ErrorMessage}
            onTryAgain={resetErrorBoundary}
        />
    );
}

const queryClient = new QueryClient();

function App({ Component, pageProps }: AppPropsWithPageTitle) {
    const { reset } = useQueryErrorResetBoundary();

    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider>
                <PageLayout pageTitle={Component.pageTitle}>
                    <UnauthorizedErrorBoundary>
                        <ErrorBoundary
                            fallbackRender={props => <UnmanagedErrorFallback {...props} />}
                            onReset={reset}
                        >
                            <Component {...pageProps} />
                        </ErrorBoundary>
                    </UnauthorizedErrorBoundary>
                </PageLayout>
            </ChakraProvider>
        </QueryClientProvider>
    );
}

export default App;
