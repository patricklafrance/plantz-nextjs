import { useSession } from "next-auth/react";

export function useSessionUserId() {
    const { data: session } = useSession();

    return session?.user?.id as string;
}
