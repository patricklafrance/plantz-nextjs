import { PlantsCollectionName } from "./mongoDb.mjs";

export async function createIndexes(mongoDb) {
    console.log("Dropping plants indexes...");

    await mongoDb.collection(PlantsCollectionName).dropIndexes();

    console.log("Creating plants indexes...");

    await mongoDb
        .collection(PlantsCollectionName)
        .createIndex({ family: "text", name: "text" });

    console.log("Plants indexes created.");
}
