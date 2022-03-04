import { isNil } from "@core/utils";
import { useSession } from "next-auth/react";

// TODO: should probably change for validating if a user account is currently loaded.
// TODO: not the best to do it, should be server side since client side cause flickers.
export function useIsAuthenticated() {
    const { data } = useSession();

    return !isNil(data);
}
