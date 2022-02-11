import { MongoClient } from "mongodb";

const Uri = process.env.MONGODB_URI;
const DbName = process.env.MONGODB_DB;

export const PlantsCollectionName = process.env.PLANTS_COLLECTION_NAME;

if (!Uri) {
    throw new Error(
        "Please define the MONGODB_URI environment variable inside .env.local"
    );
}

if (!DbName) {
    throw new Error(
        "Please define the MONGODB_DB environment variable inside .env.local"
    );
}

if (!PlantsCollectionName) {
    throw new Error(
        "Please define the PLANTS_COLLECTION_NAME environment variable inside .env.local"
    );
}

let mongoClient;
let mongoDb;

export async function connectToMongoDb() {
    if (!mongoClient && !mongoDb) {
        mongoClient = await MongoClient.connect(Uri);
        mongoDb = await mongoClient.db(DbName);
    }

    return { mongoClient, mongoDb };
}
