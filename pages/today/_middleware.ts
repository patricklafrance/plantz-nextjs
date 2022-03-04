import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { TodayRoute } from "@routes";

function parseId(pathname: string) {
    return pathname.substring(pathname.lastIndexOf("/") + 1);
}

export default function rewriteUrl(req: NextRequest, ev: NextFetchEvent) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith(`${TodayRoute}/preview`)) {
        const url = req.nextUrl.clone();

        url.searchParams.append("action", "view");
        url.searchParams.append("id", parseId(pathname));
        url.searchParams.append("viewMode", "preview");

        url.pathname = TodayRoute;

        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}
