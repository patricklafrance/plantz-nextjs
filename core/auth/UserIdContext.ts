import { createContext, useContext } from "react";

// TODO: Could define a context at the root of the app to retrive this information. The userId would be taken from the query parameters.
// TODO: Would then delete userSessionUserId and rename useContextUserId to useUserId()
// TODO: Could also delete getUserId

export interface UserIdContextType {
    userId?: string
}

export const UserIdContext = createContext<UserIdContextType>({});

export function useContextUserId() {
    const context =  useContext(UserIdContext);

    return context.userId as string;
}
