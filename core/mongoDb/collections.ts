export const PlantsCollectionName = process.env.PLANTS_COLLECTION_NAME as string;

if (!PlantsCollectionName) {
    throw new Error(
        "Please define the PLANTS_COLLECTION_NAME environment variable inside .env.local"
    );
}
