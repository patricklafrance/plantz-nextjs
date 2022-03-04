import { LoginRoute, TodayRoute, isExistingRoute } from "@routes";

import { default as GoogleProvider } from "next-auth/providers/google";
import { default as NextAuth } from "next-auth";

export default NextAuth({
    callbacks: {
        signIn: async (context) => {
            // console.log("signin: ", context);

            // TODO: create a new account if new.
            return true;
        }
    },
    pages: {
        signIn: LoginRoute
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string
        })
    ],
    // Required to encrypt the JWT token.
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        // 999 days.
        maxAge: 999 * 24 * 60 * 60
    }
});
