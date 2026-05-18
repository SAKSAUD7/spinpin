/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'standalone', // Self-contained deployment
    typescript: {
        ignoreBuildErrors: true,
    },
    eslint: {
        ignoreDuringBuilds: true,
    },
    transpilePackages: ["@repo/ui", "@repo/config"],
    images: {
        remotePatterns: [
            // SpinPin Azure Blob Storage (production media)
            {
                protocol: 'https',
                hostname: 'spinpinimages.blob.core.windows.net',
                pathname: '/**',
            },
            // SpinPin Azure App Service (backend media)
            {
                protocol: 'https',
                hostname: '*.azurewebsites.net',
                pathname: '/media/**',
            },
            // Local Django backend (development)
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '9000',
                pathname: '/media/**',
            },
            // Fallback for any http images in development
            {
                protocol: 'http',
                hostname: 'localhost',
                pathname: '/**',
            },
        ],
    },
    // Performance: compress responses
    compress: true,
    // Dev-only: reduce logging noise
    logging: {
        fetches: {
            fullUrl: false,
        },
    },
};

module.exports = nextConfig;
