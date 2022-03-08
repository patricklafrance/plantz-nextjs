import { IncomingMessage } from "http";
import { getSession } from "next-auth/react";

export async function getUserId(req: IncomingMessage) {
    const session = await getSession({ req });

    return session?.user?.id as string;
}
