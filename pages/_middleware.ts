import { NextRequest, NextResponse } from "next/server";
import { TrialExpiredRoute, isPublicRoute } from "@routes";
import { buildUrl, httpGet } from "@core/api/http";
import { isNil, isNilOrEmpty } from "@core/utils";

import { ApiGetResponse } from "@core/api";
import { JWT } from "next-auth/jwt";
import { LicensingStatus } from "@features/account";
import { withAuth } from "next-auth/middleware";

// Don't do this, instead add another env variable for the base url.
function getBaseUrl(req: NextRequest) {
    const { nextUrl } = req;

    return `${nextUrl.protocol}//${nextUrl.hostname}${!isNilOrEmpty(nextUrl.port) ? `:${nextUrl.port}` : ""}`;
}

function isApiRoute(req: NextRequest) {
    return req.url.includes("/api");
}

async function trialExpiredGate(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith(TrialExpiredRoute)) {
        return null;
    }

    const _req = req as NextRequest & { nextauth: { token: JWT } };

    // const fetchUrl = buildUrl("http://localhost:3000/api/account/getLicensingStatus", {
    const fetchUrl = buildUrl(`${getBaseUrl(req)}/api/account/getLicensingStatus`, {
        id: _req.nextauth.token.userId
    });

    const response = await httpGet<ApiGetResponse<LicensingStatus>>(fetchUrl);

    if (response.data?.data === "trial-expired") {
        const url = _req.nextUrl.clone();
        url.pathname = TrialExpiredRoute;

        return NextResponse.redirect(url);
    }

    return null;
}

async function middleware(req: NextRequest) {
    if (isPublicRoute(req.nextUrl.pathname) || isApiRoute(req)) {
        return NextResponse.next();
    }

    const response = trialExpiredGate(req);

    if (!isNil(response)) {
        return response;
    }

    return NextResponse.next();
}

export default withAuth(
    middleware,
    {
        callbacks: {
            authorized: ({ req, token }) => {
                if (isPublicRoute(req.nextUrl.pathname)) {
                    return true;
                }

                return !isNil(token);
            }
        }
    }
);
