import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { PlantInfoViewModes } from "@features/plants";
import { PlantListUrl } from "@routes";
import { buildUrl } from "@core/api/http";

function toAbsoluteUrl(relativeUrl: string) {
    // TODO: Find out how to configure the hostname in nextjs config or to build an absolute url.
    return `http://localhost:3000${relativeUrl}`;
}

function parseId(pathname: string) {
    return pathname.substring(pathname.lastIndexOf("/") + 1);
}

export function middleware(req: NextRequest, ev: NextFetchEvent) {
    const { pathname, searchParams } = req.nextUrl;

    if (pathname.startsWith(`${PlantListUrl}/add`)) {
        searchParams.append("action", "add");

        return NextResponse.rewrite(toAbsoluteUrl(buildUrl(PlantListUrl, searchParams)));
    } else if (pathname.startsWith(`${PlantListUrl}/${PlantInfoViewModes.preview}`)) {
        searchParams.append("action", "view");
        searchParams.append("id", parseId(pathname));
        searchParams.append("viewMode", PlantInfoViewModes.preview);

        return NextResponse.rewrite(toAbsoluteUrl(buildUrl(PlantListUrl, searchParams)));
    } else if (pathname.startsWith(`${PlantListUrl}/${PlantInfoViewModes.edit}`)) {
        searchParams.append("action", "view");
        searchParams.append("id", parseId(pathname));
        searchParams.append("viewMode", PlantInfoViewModes.edit);

        return NextResponse.rewrite(toAbsoluteUrl(buildUrl(PlantListUrl, searchParams)));
    }

    return NextResponse.next();
}
