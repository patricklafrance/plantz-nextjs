import { Link, StyleProps } from "@chakra-ui/react";

import { default as NextLink } from "next/link";
import { TodayRoute } from "@routes";

export function Logo(props: StyleProps) {
    return (
        <NextLink href={TodayRoute} passHref>
            <Link
                {...props}
                fontSize="2xl"
                fontWeight={500}
                _hover={{
                    textDecoration: "none"
                }}
            >
                Plantz
            </Link>
        </NextLink>
    );
}
