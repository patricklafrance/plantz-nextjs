import { Db, MongoClient } from "mongodb";

import { connect } from "./connect";

export type ExecuteFunction<T = unknown> = (database: Db, client: MongoClient) => Promise<T>;

export async function executeMongoDb<T = unknown>(execute: ExecuteFunction<T>) {
    const { client, database } = await connect();

    return execute(database, client);
}
