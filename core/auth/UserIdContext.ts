import { createContext, useContext } from "react";

export interface UserIdContextType {
    userId?: string
}

export const UserIdContext = createContext<UserIdContextType>({});

export function useUserIdContext() {
    const context =  useContext(UserIdContext);

    return context.userId as string;
}
