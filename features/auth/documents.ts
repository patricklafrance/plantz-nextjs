import { WithId } from "mongodb";

export const UsersCollectionName = "users";

export interface UserDocument extends WithId<Document> {
    email: string;
    emailVerified?: boolean;
    image: string;
    name: string;
}
