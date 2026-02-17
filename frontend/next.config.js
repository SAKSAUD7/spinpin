/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Create self-contained deployment for Azure
    typescript: {
        ignoreBuildErrors: true, // Temporarily bypass TypeScript errors
    },
    eslint: {
        ignoreDuringBuilds: true, // Temporarily bypass ESLint errors
    },
    transpilePackages: ["@repo/ui", "@repo/config"],
    images: {
        // App Service supports image optimization
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'ninjaparkimages.blob.core.windows.net',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'ninjainflablepark-gbhwbbdna5hjgvf9.centralindia-01.azurewebsites.net',
                pathname: '/media/**',
            },
        ],
    },
};

module.exports = nextConfig;
