/* Core */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    experimental: {
        reactCompiler: true,
        ppr: true,
    },
    transpilePackages: ['ui'],
};

export default nextConfig;
