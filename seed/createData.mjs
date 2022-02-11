import { PlantsCollectionName } from "./mongoDb.mjs";

export async function createData(mongoDb) {
    console.log("Dropping plants collection...");

    await mongoDb.collection(PlantsCollectionName).drop();

    console.log("Creating plants...");

    await mongoDb.collection(PlantsCollectionName).insertMany([
        {
            creationDate: Date.now(),
            description: "",
            family: "Aaceae",
            location: "living-room",
            luminosity: "medium",
            mistLeaves: true,
            name: "Philodendron cordatum",
            soilType: "",
            wateringFrequency: "1-week",
            wateringQuantity: "100ml",
            wateringType: "surface",
        },
        {
            creationDate: Date.now(),
            description:
                "Scindapsus pictus, or silver vine, is a species of flowering plant in the arum family Araceae, native to India, Bangladesh, Thailand, Peninsular Malaysia, Borneo, Java, Sumatra, Sulawesi, and the Philippines. Growing to 3 m tall in open ground, it is an evergreen climber.",
            family: "Araceae",
            location: "bedroom",
            luminosity: "low",
            mistLeaves: false,
            name: "Satin pothos",
            soilType: "",
            wateringFrequency: "1.5-week",
            wateringQuantity: "124ml",
            wateringType: "surface",
        },
        {
            creationDate: Date.now(),
            description:
                "Dracaena is a genus of about 120 species of trees and succulent shrubs. The formerly accepted genera Pleomele and Sansevieria are now included in Dracaena. In the APG IV classification system, it is placed in the family Asparagaceae, subfamily Nolinoideae.",
            family: "Asparagaceae",
            location: "living-room",
            luminosity: "high",
            mistLeaves: true,
            name: "Dracaena",
            soilType: "",
            wateringFrequency: "2-weeks",
            wateringQuantity: "1 cup",
            wateringType: "surface",
        },
    ]);

    console.log("Plants created.");
}
