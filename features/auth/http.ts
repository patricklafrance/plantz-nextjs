import { GenerateFakeDataModel } from "@features/db";
import { usePost } from "@core/api/http";

export function useGenerateFakeData() {
    return usePost<GenerateFakeDataModel>("/api/db/seed");
}
