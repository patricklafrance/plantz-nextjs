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

export async function withMongoDb<T>(execute: (database: Db, client: MongoClient) => Promise<T>) {
    // @ts-ignore
    if (isNil(global.mongoDb.database)) {
        const client = await MongoClient.connect(Uri as string);
        const database = await client.db(DbName);

        // @ts-ignore
        global.mongoDb.client = client;
        // @ts-ignore
        global.mongoDb.database = database;
    }

    // @ts-ignore
    const result = await execute(global.mongoDb.database, global.mongoDb.client);

    return result;
}

// export async function withMongoDb<T>(execute: WithMongoDbExecuteFunction<T>) {
//     const client = await MongoClient.connect(Uri as string);
//     const database = await client.db(DbName);

//     const result = await execute(database, client);

//     client.close();

//     return result;
// }
