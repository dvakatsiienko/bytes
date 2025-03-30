import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'media.rawg.io',
                port: '',
                pathname: '**',
                search: '',
            },
        ],
    },
};
export default nextConfig;
