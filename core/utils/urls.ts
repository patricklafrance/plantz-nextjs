export function removeParameters(url: string) {
    const index = url.indexOf("?");

    return url.substring(0, index === -1 ? undefined : index);
}

export function extractRoute(url: string, baseUrl: string) {
    let route = url;

    if (url.startsWith("http://")) {
        route = url.substring(baseUrl.length);
    }

    return removeParameters(route);
}
