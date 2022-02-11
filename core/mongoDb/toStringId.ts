import { Document, WithId } from "mongodb";

import { Nullable } from "@core/types";

export function toStringId<T>(document: Nullable<WithId<Document>>) {
    // @ts-ignore
    document._id = document._id.toString();

    return (document as unknown) as T;
}
