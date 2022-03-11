export const LoginRoute = "/login";

export const AccountRoute = "/account";
export const NewAccountRoute = "/account/new-account";
export const TrialExpiredRoute = "/account/trial-expired";

export const PlantListRoute = "/plants";
export const TodayRoute = "/today";

export const TermsRoute = "/terms";

export const PublicRoutes = [LoginRoute];

export function isPublicRoute(url: string) {
    return PublicRoutes.some(x => url.startsWith(x));
}
