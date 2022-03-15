import "./_app.css";

import { ApiClientFailureReasons, isApiError } from "@core/api/http";
import { Component, ReactNode, useEffect } from "react";
import { ErrorBoundary, FallbackProps } from "react-error-boundary";
import { NextRouter, useRouter, withRouter } from "next/router";
import { QueryClient, QueryClientProvider, useQueryErrorResetBoundary } from "react-query";

import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { Error } from "@components";
import { LoginRoute } from "@routes";
import { NextPage } from "next";
import { ReactQueryDevtools } from "react-query/devtools";
import { SessionProvider } from "next-auth/react";
import { isNil } from "@core/utils";
import { default as nProgress } from "nprogress";

function useProgressBar() {
    const router = useRouter();

    useEffect(() => {
        // nProgress setup, read https://www.akmittal.dev/posts/nextjs-navigation-progress-bar.
        router.events.on("routeChangeStart", nProgress.start);
        router.events.on("routeChangeError", nProgress.done);
        router.events.on("routeChangeComplete", nProgress.done);

        return () => {
            router.events.off("routeChangeStart", nProgress.start);
            router.events.off("routeChangeError", nProgress.done);
            router.events.off("routeChangeComplete", nProgress.done);
        };
    }, [router]);
}

export type Page = NextPage & {
    getLayout: (page: ReactNode) => ReactNode;
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
                this.props.router.push(LoginRoute);
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

function App({
    Component,
    pageProps
}: AppPropsWithPageTitle) {
    useProgressBar();

    const { reset } = useQueryErrorResetBoundary();

    // This is a page owned by NextJs.
    if (isNil(Component.getLayout)) {
        return (
            <Component {...pageProps} />
        );
    }

    const Layout = Component.getLayout(
        <UnauthorizedErrorBoundary>
            <ErrorBoundary
                fallbackRender={props => <UnmanagedErrorFallback {...props} />}
                onReset={reset}
            >
                <Component {...pageProps} />
            </ErrorBoundary>
        </UnauthorizedErrorBoundary>
    );

    return (
        <QueryClientProvider client={queryClient}>
            <ChakraProvider>
                <SessionProvider
                    // Must pass undefined otherwise nothing works... lol
                    session={undefined}
                    refetchInterval={0}
                    refetchOnWindowFocus={false}
                >
                    {Layout}
                </SessionProvider>
            </ChakraProvider>
            <ReactQueryDevtools />
        </QueryClientProvider>
    );
}

export default App;

