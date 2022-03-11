import { NextRequest, NextResponse } from "next/server";
import { TrialExpiredRoute, isPublicRoute } from "@routes";
import { buildUrl, httpGet } from "@core/api/http";

import { ApiGetResponse } from "@core/api";
import { JWT } from "next-auth/jwt";
import { LicensingStatus } from "@features/account";
import { isNil } from "@core/utils";
import { withAuth } from "next-auth/middleware";

function isApiRoute(req: NextRequest) {
    return req.url.includes("/api");
}

async function trialExpiredGate(req: NextRequest) {
    if (req.nextUrl.pathname.startsWith(TrialExpiredRoute)) {
        return null;
    }

    const _req = req as NextRequest & { nextauth: { token: JWT } };

    const fetchUrl = buildUrl("http://localhost:3000/api/account/getLicensingStatus", {
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
    if (isApiRoute(req)) {
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
