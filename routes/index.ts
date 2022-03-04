export const TodayRoute = "/today";
export const PlantListRoute = "/plants";

export const LoginRoute = "/login";

export const PublicRoutes = [LoginRoute];

export const AllRoutes = [TodayRoute, PlantListRoute, LoginRoute];

export function isPublicRoute(url: string) {
    return PublicRoutes.some(x => url.startsWith(x));
}

export function isExistingRoute(url: string) {
    return AllRoutes.some(x => x === url);
}
