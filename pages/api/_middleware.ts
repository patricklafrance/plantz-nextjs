import { isNil } from "@core/utils";
import { withAuth } from "next-auth/middleware";

export default withAuth({
    callbacks: {
        authorized: ({ token }) => {
            return !isNil(token);
        }
    }
});
