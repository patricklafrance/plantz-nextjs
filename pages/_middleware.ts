import { NextRequest, NextResponse } from "next/server";

import { isNil } from "@core/utils";
import { isPublicRoute } from "@routes";
import { withAuth } from "next-auth/middleware";

// export default withAuth({
//     callbacks: {
//         authorized: ({ req, token }) => {
//             if (isPublicRoute(req.nextUrl.pathname)) {
//                 return true;
//             }

//             return !isNil(token);
//         }
//     }
// });

function trialGate(req: NextRequest) {


    return NextResponse.next();
}

export default withAuth(
    trialGate,
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
