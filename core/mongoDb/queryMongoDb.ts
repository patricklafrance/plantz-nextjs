import { Db, MongoClient } from "mongodb";

import { connectMongoDb } from "./connectMongoDb";

export type QueryFunction<T> = (database: Db, client: MongoClient) => Promise<T>;

export async function queryMongoDb<T>(query: QueryFunction<T>) {
    const { client, database } = await connectMongoDb();

    return query(database, client);
}
