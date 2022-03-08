import { Db, MongoClient } from "mongodb";

import { isNil } from "@core/utils";

const Uri = process.env.MONGODB_URI;
const DbName = process.env.MONGODB_DB;

// /**
//  * Global is used here to maintain a cached connection across hot reloads
//  * in development. This prevents connections growing exponentiatlly
//  * during API Route usage.
//  * https://github.com/vercel/next.js/pull/17666
//  */
// @ts-ignore
global.mongoDb = global.mongoDb || {};

export async function connectMongoDb() {
    // @ts-ignore
    if (isNil(global.mongoDb.database)) {
        try {
            const client = await MongoClient.connect(Uri as string);
            const database = await client.db(DbName);

            // @ts-ignore
            global.mongoDb.client = client;
            // @ts-ignore
            global.mongoDb.database = database;
        }
        catch (error) {
            console.log(`Cannot connect to Mongo DB: ${Uri} - ${DbName}`);

            throw error;
        }
    }

    return {
        // @ts-ignore
        client: global.mongoDb.client as MongoClient,
        // @ts-ignore
        database: global.mongoDb.database as Db
    };
}
