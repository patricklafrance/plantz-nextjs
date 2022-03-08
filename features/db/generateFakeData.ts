import { Db, Document, ObjectId } from "mongodb";
import { PlantsCollectionName, WateringFrequency } from "@features/plants/server";

import { faker } from "@faker-js/faker";
import fs from "fs";
import { getNextWateringDate } from "@features/plants";
import parse from "csv-parse";

const Families = ["Umbelliferae", "Lamiaceae", "Solanaceae", "Asteraceae", "Brassicaceae", "Liliaceae", "Rosaceae", "Cucurbitaceae"];

const Locations = ["bathroom-main-floor", "bathroom-basement", "basement-front", "basement-back", "bedroom", "dining-room", "kitchen", "living-room"];

const Luminosities = ["high", "low", "medium"];

const SoilTypes = ["Sand", "Silt", "Clay"];

const WateringFrequencies = ["0.5-week", "1-week", "1.5-weeks", "2-weeks", "2.5-weeks", "3-weeks", "3.5-weeks", "4-weeks"];

const WateringTypes = ["deep", "surface"];

function readPlants() {
    return new Promise((resolve, reject) => {
        const records: string[] = [];

        fs.createReadStream("./features/db/plants.csv")
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

export async function generateFakeData(database: Db, userId: string, pageCount: number = 10) {
    console.log("Dropping plants collection...");

    try {
        await database.collection(PlantsCollectionName).drop();
    }
    catch (error) {
        // ignore...
    }

    console.log("Creating plants...");

    const _userId = new ObjectId(userId);

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
                nextWateringDate: getNextWateringDate(date, frequency),
                soilType: faker.random.arrayElement(SoilTypes),
                userId: _userId,
                wateringFrequency: frequency,
                wateringQuantity: `${faker.datatype.number({ max: 350, min: 100 })}ml`,
                wateringType: faker.random.arrayElement(WateringTypes)
            });
        }

        await database.collection(PlantsCollectionName).insertMany(page);
    }

    console.log("Plants created.");
}
