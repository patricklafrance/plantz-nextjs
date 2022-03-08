import { Db } from "mongodb";
import { PlantsCollectionName } from "@features/plants/documents";

export async function createIndexes(database: Db) {
    console.log("Dropping plants indexes...");

    await database.collection(PlantsCollectionName).dropIndexes();

    console.log("Creating plants indexes...");

    await database
        .collection(PlantsCollectionName)
        .createIndex({ family: "text", name: "text" });

    console.log("Plants indexes created.");
}
