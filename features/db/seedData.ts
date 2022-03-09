import { Db, ObjectId } from "mongodb";

import { PlantsCollectionName } from "@features/plants/documents";

export async function seedData(database: Db, userId: string) {
    console.log("Deleting existing plants...");

    const _userId = new ObjectId(userId);

    try {
        const bulk = database.collection(PlantsCollectionName).initializeUnorderedBulkOp();

        bulk.find({ userId: _userId }).delete();

        await bulk.execute();
    }
    catch (error) {
        // ignore...
    }

    console.log("Creating plants...");

    await database.collection(PlantsCollectionName).insertMany([
        {
            creationDate: new Date(),
            description: "",
            family: "Aaceae",
            location: "living-room",
            luminosity: "medium",
            mistLeaves: true,
            name: "Philodendron cordatum",
            soilType: "",
            userId: _userId,
            wateringFrequency: "1-week",
            wateringQuantity: "100ml",
            wateringType: "surface",
        },
        {
            creationDate: new Date(),
            description: "Scindapsus pictus, or silver vine, is a species of flowering plant in the arum family Araceae, native to India, Bangladesh, Thailand, Peninsular Malaysia, Borneo, Java, Sumatra, Sulawesi, and the Philippines. Growing to 3 m tall in open ground, it is an evergreen climber.",
            family: "Araceae",
            location: "bedroom",
            luminosity: "low",
            mistLeaves: false,
            name: "Satin pothos",
            soilType: "",
            userId: _userId,
            wateringFrequency: "1.5-weeks",
            wateringQuantity: "124ml",
            wateringType: "surface",
        },
        {
            creationDate: new Date(),
            description: "Dracaena is a genus of about 120 species of trees and succulent shrubs. The formerly accepted genera Pleomele and Sansevieria are now included in Dracaena. In the APG IV classification system, it is placed in the family Asparagaceae, subfamily Nolinoideae.",
            family: "Asparagaceae",
            location: "living-room",
            luminosity: "high",
            mistLeaves: true,
            name: "Dracaena",
            soilType: "",
            userId: _userId,
            wateringFrequency: "2-weeks",
            wateringQuantity: "1 cup",
            wateringType: "surface",
        }
    ]);

    console.log("Plants created.");
}
