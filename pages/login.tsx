import { Button } from "@chakra-ui/react";
import { useCallback } from "react";
import { useRouter } from "next/router";

export default function LoginPage() {
    const router = useRouter();

    const handleLogin = useCallback(() => {
        router.push("/plants");
    }, [router]);

    return (
        <Button onClick={handleLogin}>Login</Button>
    );
}

LoginPage.pageTitle = "Login";
