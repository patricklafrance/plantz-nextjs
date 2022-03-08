import { Db, MongoClient } from "mongodb";

import { connectMongoDb } from "./connectMongoDb";

export type ExecuteFunction<T = unknown> = (database: Db, client: MongoClient) => Promise<T>;

export async function executeMongoDb<T = unknown>(execute: ExecuteFunction<T>) {
    const { client, database } = await connectMongoDb();

    return execute(database, client);
}
