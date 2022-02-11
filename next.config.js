/** @type {import("next").NextConfig} */

module.exports = {
    eslint: {
        ignoreDuringBuilds: true
    },

    async redirects() {
        return [
            {
                destination: "/plants",
                permanent: true,
                source: "/",
            },
        ];
    }
};
