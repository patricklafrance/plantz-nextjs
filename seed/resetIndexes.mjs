import { connectToMongoDb } from "./mongoDb.mjs";
import { createIndexes } from "./createIndexes.mjs";

console.log("Reseting indexes...");

console.log("Connecting to database...");

const { mongoDb } = await connectToMongoDb();

await createIndexes(mongoDb);

console.log("Indexes resets...");

process.exit(0);
