import { useFetchSingle, usePost } from "@core/api/http";

import { GenerateFakeDataModel } from "@features/db";
import { UserModel } from "./models";

const FetchSingleUserUrl = "/api/account/getUser";

export function useGenerateFakeData() {
    return usePost<GenerateFakeDataModel>("/api/db/seed");
}

export function useFetchUser(id: string) {
    return useFetchSingle<UserModel>(FetchSingleUserUrl, id);
}
