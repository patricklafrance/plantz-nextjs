import { ObjectId } from "mongodb";

export function toSerializableId(id: ObjectId) {
    return id.toString();
}
