import { MongoClient } from "mongodb";
import { isNil } from "@core/utils";

const Uri = process.env.MONGODB_URI;
const DbName = process.env.MONGODB_DB;

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentiatlly
 * during API Route usage.
 * https://github.com/vercel/next.js/pull/17666
 */
// @ts-ignore
global.mongoDb = global.mongoDb || {};

export async function connectToMongoDb() {
    // @ts-ignore
    if (isNil(global.mongoDb.client)) {
        // @ts-ignore
        global.mongoDb.client = await MongoClient.connect(Uri as string);
    }

    // @ts-ignore
    const db = await global.mongoDb.client.db(DbName);

    return {
        mongoDb: db
    };
}

// import { Db, MongoClient } from "mongodb";

// import { isNil } from "@core/utils";

// const Uri = process.env.MONGODB_URI;
// const DbName = process.env.MONGODB_DB;

// interface Database {
//     mongoClient: MongoClient;
//     mongoDb: Db;
// }

// if (!Uri) {
//     throw new Error("Please define the MONGODB_URI environment variable inside .env.local");
// }

// if (!DbName) {
//     throw new Error("Please define the MONGODB_DB environment variable inside .env.local");
// }

// export async function connectToMongoDb() {
//     // @ts-ignore
//     const db: Database = global.db ?? {};

//     if (isNil(db.mongoClient) && isNil(db.mongoDb)) {
//         const mongoClient = await MongoClient.connect(Uri as string);
//         const mongoDb = await mongoClient.db(DbName);

//         // @ts-ignore
//         global.db = {
//             mongoClient,
//             mongoDb
//         };
//     }

//     return {
//         mongoClient: db.mongoClient,
//         mongoDb: db.mongoDb
//     };
// }
