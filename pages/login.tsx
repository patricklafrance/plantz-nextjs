import { Box, Button, Center, Divider, Flex, Heading, Stack, Text, useColorModeValue } from "@chakra-ui/react";
import { getSession, signIn } from "next-auth/react";
import { useCallback, useState } from "react";

import { GetServerSideProps } from "next";
import { TodayRoute } from "@routes";
import { isNil } from "@core/utils";

interface GoogleIconProps {
    active: boolean;
}

function GoogleIcon({ active }: GoogleIconProps) {
    return (
        <div style={{ background: active ? "#eee" : "#fff", borderRadius: "2px", padding: "10px" }}>
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                <g fill="#000" fillRule="evenodd">
                    <path
                        d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
                        fill="#EA4335"
                    />
                    <path d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.1.83-.64 2.08-1.84 2.92l2.84 2.2c1.7-1.57 2.68-3.88 2.68-6.62z" fill="#4285F4" />
                    <path
                        d="M3.88 10.78A5.54 5.54 0 0 1 3.58 9c0-.62.11-1.22.29-1.78L.96 4.96A9.008 9.008 0 0 0 0 9c0 1.45.35 2.82.96 4.04l2.92-2.26z"
                        fill="#FBBC05"
                    />
                    <path
                        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.97 13.04C2.45 15.98 5.48 18 9 18z"
                        fill="#34A853"
                    />
                    <path fill="none" d="M0 0h18v18H0z" />
                </g>
            </svg>
        </div>
    );
}

interface GoogleButtonProps {
    onClick: () => void;
}

function GoogleButton({ onClick }: GoogleButtonProps) {
    const [active, setActive] = useState(false);

    const handleMouseLeave = useCallback(() => {
        setActive(false);
    }, []);

    const handleMouseDown = useCallback(() => {
        setActive(false);
    }, []);

    const handleMouseUp = useCallback(() => {
        setActive(true);
    }, []);

    return (
        <Button
            backgroundColor={useColorModeValue("rgb(66, 133, 244)", "#fff")}
            display="inline-flex"
            alignItems="center"
            color={useColorModeValue("#fff", "rgba(0, 0, 0, .54)")}
            boxShadow="0 2px 2px 0 rgba(0, 0, 0, .24), 0 0 1px 0 rgba(0, 0, 0, .24)"
            padding={0}
            borderRadius="2px"
            border="1px solid transparent"
            fontSize="14px"
            fontWeight={500}
            fontFamily="Roboto, sans-serif"
            onClick={onClick}
            _hover={{
                cursor: "pointer",
                opacity: 0.9
            }}
            _active={{
                backgroundColor: useColorModeValue("#3367D6", "#eee"),
                color: useColorModeValue("#fff", "rgba(0, 0, 0, .54)"),
                cursor: "pointer",
                opacity: 1
            }}
            onMouseLeave={handleMouseLeave}
            onMouseDown={handleMouseDown}
            onMouseUp={handleMouseUp}
            leftIcon={<GoogleIcon active={active} />}
        >
            <Box
                paddingRight="10px"
                paddingY="10px"
                fontWeight={500}
                as="span"
            >
                Sign in with Google
            </Box>
        </Button>
    );
}

export default function LoginPage() {
    const handleLogin = useCallback(() => {
        signIn("google");
    }, []);

    return (
        <Center
            width="100%"
            height="100%"
        >
            <Flex
                direction={{ base: "column", sm: "row" }}
                alignItems={{ base: "center", sm: "initial" }}
                gap={{ base: 6, sm: "140px" }}
            >
                <Stack>
                    <Heading
                        as="h1"
                        size="2xl"
                        marginBottom={4}
                    >
                        Log In to Plantz
                    </Heading>
                    <Divider backgroundColor="teal" height="1px" width="140px" />
                    <Text
                        as="div"
                        fontSize="lg"
                        paddingTop={3}
                    >
                        You'll be taken to Google to authenticate.
                    </Text>
                </Stack>
                <Center>
                    <GoogleButton onClick={handleLogin} />
                </Center>
            </Flex>
        </Center>
    );
}

LoginPage.pageTitle = "Login";

export const getServerSideProps: GetServerSideProps = async ({ query, req }) => {
    const session = await getSession({ req });

    if (!isNil(session)) {
        const callbackUrl = query.callbackUrl as string;

        return {
            redirect: {
                destination: !isNil(callbackUrl) ? callbackUrl : TodayRoute,
                permanent: false
            }
        };
    }

    return {
        props: {}
    };
};
