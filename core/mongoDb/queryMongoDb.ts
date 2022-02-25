import { Db, MongoClient } from "mongodb";

import { connect } from "./connect";

export type QueryFunction<T> = (database: Db, client: MongoClient) => Promise<T>;

export async function queryMongoDb<T>(query: QueryFunction<T>) {
    const { client, database } = await connect();

    return query(database, client);
}
