import { LicensingStatus } from "./models";
import { WithId } from "mongodb";
import { toSerializableId } from "@core/api";

export const UsersCollectionName = "users";

export interface UserDocument extends WithId<Document> {
    email: string;
    emailVerified?: boolean;
    image: string;
    licensingStatus: LicensingStatus;
    name: string;
}

export function toUserModel(document: UserDocument) {
    return {
        email: document.email,
        id: toSerializableId(document._id),
        image: document.image,
        licensingStatus: document.licensingStatus,
        name: document.name
    };
}
