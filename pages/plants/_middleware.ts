import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { PlantListRoute } from "@routes";

function parseId(pathname: string) {
    return pathname.substring(pathname.lastIndexOf("/") + 1);
}

export default function rewriteModalRoutes(req: NextRequest, ev: NextFetchEvent) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith(`${PlantListRoute}/add`)) {
        const url = req.nextUrl.clone();

        url.searchParams.append("action", "add");
        url.pathname = PlantListRoute;

        return NextResponse.rewrite(url);
    } else if (pathname.startsWith(`${PlantListRoute}/preview`)) {
        const url = req.nextUrl.clone();

        url.searchParams.append("action", "view");
        url.searchParams.append("id", parseId(pathname));
        url.searchParams.append("viewMode", "preview");

        url.pathname = PlantListRoute;

        return NextResponse.rewrite(url);
    } else if (pathname.startsWith(`${PlantListRoute}/edit`)) {
        const url = req.nextUrl.clone();

        url.searchParams.append("action", "view");
        url.searchParams.append("id", parseId(pathname));
        url.searchParams.append("viewMode", "edit");

        url.pathname = PlantListRoute;

        return NextResponse.rewrite(url);
    }

    return NextResponse.next();
}
