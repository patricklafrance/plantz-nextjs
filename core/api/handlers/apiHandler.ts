import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const isDebug = process.env.NODE_ENV === "development";

export type ApiHandlers = {
    delete?: NextApiHandler;
    get?: NextApiHandler;
    post?: NextApiHandler;
    put?: NextApiHandler;
}

export function apiHandler(handlers: ApiHandlers) {
    return async (req: NextApiRequest, res: NextApiResponse) => {
        const method = req.method?.toLowerCase();

        const handler = handlers[method as keyof ApiHandlers];

        if (!handler) {
            res.status(405).end(`Method ${req.method} Not Allowed.`);
        } else {
            try {
                await handler(req, res);
            }
            catch (error: any) {
                // Log to Vercel functions logs.
                console.error(error);

                res.status(500).end(isDebug ? error.toString() : "");
            }
        }
    };
}
