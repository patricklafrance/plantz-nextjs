import { UserDocument } from "./documents";
import { toSerializableId } from "@core/api";

export interface UserModel {
    email: string;
    id: string;
    image: string;
    name: string;
}

export function toUserModel(document: UserDocument) {
    return {
        email: document.email,
        id: toSerializableId(document._id),
        image: document.image,
        name: document.name
    };
}
