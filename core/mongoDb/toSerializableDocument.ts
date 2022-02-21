import { Document, WithId } from "mongodb";

import { Nullable } from "@core/types";
import { isNil } from "@core/utils";

export function toSerializableModel<T>(document: Nullable<WithId<Document>>) {
    if (isNil(document)) {
        return document;
    }

    // @ts-ignore
    document.id = document._id.toString();
    // @ts-ignore
    delete document._id;

    return (document as unknown) as T;
}
