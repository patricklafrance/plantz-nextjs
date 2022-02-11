import { connectToMongoDb } from "./mongoDb.mjs";
import { createData } from "./createData.mjs";
import { createIndexes } from "./createIndexes.mjs";

console.log("Starting seed...");

console.log("Connecting to database...");

const { mongoDb } = await connectToMongoDb();

await createData(mongoDb);
await createIndexes(mongoDb);

console.log("Seed completed...");

process.exit(0);
