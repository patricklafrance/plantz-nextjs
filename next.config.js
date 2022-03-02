/** @type {import("next").NextConfig} */

module.exports = {
    eslint: {
        ignoreDuringBuilds: true,
    },

    async redirects() {
        return [
            {
                destination: "/today",
                permanent: true,
                source: "/",
            },
        ];
    },
};
