import { NextFetchEvent, NextRequest, NextResponse } from "next/server";

import { PlantListUrl } from "@routes";

function parseId(pathname: string) {
    return pathname.substring(pathname.lastIndexOf("/") + 1);
}

export function middleware(req: NextRequest, ev: NextFetchEvent) {
    const { pathname } = req.nextUrl;

    if (pathname.startsWith(`${PlantListUrl}/add`)) {
        const url = req.nextUrl.clone();

        url.searchParams.append("action", "add");
        url.pathname = PlantListUrl;

        return NextResponse.rewrite(url);
    } else if (pathname.startsWith(`${PlantListUrl}/preview`)) {
        const url = req.nextUrl.clone();

        url.searchParams.append("action", "view");
        url.searchParams.append("id", parseId(pathname));
        url.searchParams.append("viewMode", "preview");

        url.pathname = PlantListUrl;

        return NextResponse.rewrite(url);
    } else if (pathname.startsWith(`${PlantListUrl}/edit`)) {
        const url = req.nextUrl.clone();

        url.searchParams.append("action", "view");
        url.searchParams.append("id", parseId(pathname));
        url.searchParams.append("viewMode", "edit");

        url.pathname = PlantListUrl;

        return NextResponse.rewrite(url);
    }






    // const { pathname, searchParams } = req.nextUrl;

    // if (pathname.startsWith(`${PlantListUrl}/add`)) {
    //     searchParams.append("action", "add");

    //     return NextResponse.rewrite(toAbsoluteUrl(buildUrl(PlantListUrl, searchParams)));
    // } else if (pathname.startsWith(`${PlantListUrl}/${PlantInfoViewModes.preview}`)) {
    //     searchParams.append("action", "view");
    //     searchParams.append("id", parseId(pathname));
    //     searchParams.append("viewMode", PlantInfoViewModes.preview);

    //     return NextResponse.rewrite(toAbsoluteUrl(buildUrl(PlantListUrl, searchParams)));
    // } else if (pathname.startsWith(`${PlantListUrl}/${PlantInfoViewModes.edit}`)) {
    //     searchParams.append("action", "view");
    //     searchParams.append("id", parseId(pathname));
    //     searchParams.append("viewMode", PlantInfoViewModes.edit);

    //     return NextResponse.rewrite(toAbsoluteUrl(buildUrl(PlantListUrl, searchParams)));
    // }

    return NextResponse.next();
}
