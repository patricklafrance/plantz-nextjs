import { LoginRoute, NewAccountRoute } from "@routes";

import { default as GoogleProvider } from "next-auth/providers/google";
import { MongoClient } from "mongodb";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import { default as NextAuth } from "next-auth";
import { connectMongoDb } from "@core/mongoDb/server";
import { isNil } from "@core/utils";

export default NextAuth({
    adapter: MongoDBAdapter(new Promise<MongoClient>((resolve, reject) => {
        connectMongoDb()
            .then(({ client }: { client: MongoClient }) => {
                resolve(client);
            })
            .catch(reject);
    })),
    callbacks: {
        jwt: async ({ token, user }) => {
            if (user) {
                token.userId = user.id;
            }

            return token;
        },
        session: async ({ session, token }) => {
            if (!isNil(session.user) && !isNil(token)) {
                session.user.id = token.userId;
            }

            return session;
        }
    },
    pages: {
        newUser: NewAccountRoute,
        signIn: LoginRoute
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_SECRET as string,
            profile(profile) {
                return {
                    email: profile.email,
                    id: profile.sub,
                    image: profile.picture,
                    licensingStatus: "paid",
                    name: profile.name
                };
            },
        })
    ],
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        // 999 days
        maxAge: 999 * 24 * 60 * 60,
        strategy: "jwt"
    }
});
