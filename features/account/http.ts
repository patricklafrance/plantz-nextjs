import { UpdateLicensingStatusModel, UserModel } from "./models";
import { useFetchSingle, usePost, usePut } from "@core/api/http";

import { GenerateFakeDataModel } from "@features/db";
import { useCallback } from "react";

const FetchSingleUserUrl = "/api/account/getUser";
const UpdateLicensingStatusUrl = "/api/account/updateLicensingStatus";

export function useGenerateFakeData() {
    return usePost<GenerateFakeDataModel>("/api/db/seed");
}

export function useFetchUser(id: string) {
    return useFetchSingle<UserModel>(FetchSingleUserUrl, id);
}

export function useUpdateLicensingStatus() {
    const getInvalidateKeys = useCallback((variables: UpdateLicensingStatusModel) => {
        return [[FetchSingleUserUrl, variables.userId]];
    }, []);

    return usePut<UpdateLicensingStatusModel>(UpdateLicensingStatusUrl, {
        invalidateKeys: getInvalidateKeys
    });
}
