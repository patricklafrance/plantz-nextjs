import { Db, Document } from "mongodb";
import { NextApiRequest, NextApiResponse } from "next";
import { WateringFrequency, getNextWateringDate } from "@features/plants";

import { PlantsCollectionName } from "@features/plants/server";
import { apiHandler } from "@core/api/handlers/server";
import { executeMongoDb } from "@core/mongoDb/server";
import { faker } from "@faker-js/faker";
import fs from "fs";
import parse from "csv-parse";
import { removeTimeFromDate } from "@core/utils";

const Families = ["Umbelliferae", "Lamiaceae", "Solanaceae", "Asteraceae", "Brassicaceae", "Liliaceae", "Rosaceae", "Cucurbitaceae"];

const Locations = ["bathroom-main-floor", "bathroom-basement", "basement-front", "basement-back", "bedroom", "dining-room", "kitchen", "living-room"];

const Luminosities = ["high", "low", "medium"];

const SoilTypes = ["Sand", "Silt", "Clay"];

const WateringFrequencies = ["0.5-week", "1-week", "1.5-weeks", "2-weeks", "2.5-weeks", "3-weeks", "3.5-weeks", "4-weeks"];

const WateringTypes = ["deep", "surface"];

function readPlants() {
    return new Promise((resolve, reject) => {
        const records: string[] = [];

        fs.createReadStream("./pages/api/db/plants.csv")
            .on("error", error => {
                reject(error);
            })
            .pipe(parse({
                delimiter: ",",
            }))
            .on("data", (record: string[]) => {
                const name = record[0];

                records.push(name.charAt(0).toUpperCase() + name.slice(1));
            })
            .on("error", (error) => {
                reject(error);
            })
            .on("end", () => {
                resolve(records);
            });
    }) as Promise<string[]>;
}

async function createFakeData(database: Db, pageCount: number = 10) {
    console.log("Dropping plants collection...");

    await database.collection(PlantsCollectionName).drop();

    console.log("Creating plants...");

    const names = await readPlants();

    for (let i = 0; i < pageCount; i += 1) {
        const page: Document[] = [];

        for (let j = 0; j < 20; j += 1) {
            const date = faker.date.recent(10);
            const frequency = faker.random.arrayElement(WateringFrequencies) as WateringFrequency;

            page.push({
                creationDate: date,
                description: faker.lorem.sentence(faker.datatype.number({ max: 25, min: 10 })),
                family: faker.random.arrayElement(Families),
                location: faker.random.arrayElement(Locations),
                luminosity: faker.random.arrayElement(Luminosities),
                mistLeaves: faker.datatype.boolean(),
                name: faker.random.arrayElement(names),
                nextWateringDate: getNextWateringDate(removeTimeFromDate(date), frequency),
                soilType: faker.random.arrayElement(SoilTypes),
                wateringFrequency: frequency,
                wateringQuantity: `${faker.datatype.number({ max: 350, min: 100 })}ml`,
                wateringType: faker.random.arrayElement(WateringTypes)
            });
        }

        await database.collection(PlantsCollectionName).insertMany(page);
    }

    console.log("Plants created.");
}

async function createCustomData(database: Db) {
    console.log("Dropping plants collection...");

    await database.collection(PlantsCollectionName).drop();

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
            wateringFrequency: "2-weeks",
            wateringQuantity: "1 cup",
            wateringType: "surface",
        }
    ]);

    console.log("Plants created.");
}

async function createIndexes(database: Db) {
    console.log("Dropping plants indexes...");

    await database.collection(PlantsCollectionName).dropIndexes();

    console.log("Creating plants indexes...");

    await database
        .collection(PlantsCollectionName)
        .createIndex({ family: "text", name: "text" });

    console.log("Plants indexes created.");
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
    try {
        await executeMongoDb(async database => {
            const { fake = false, pageCount = "10" } = req.query;

            console.log("Starting seed...");

            if (fake) {
                await createFakeData(database, parseInt(pageCount as string));
            } else {
                await createCustomData(database);
            }
            await createIndexes(database);

            console.log("Seed completed...");

            res.status(200).end();
        });
    } catch(error: any) {
        res.status(500).json({
            error: error
        });
    }
}

export default apiHandler({
    get: handleGet,
});
