/* Core */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    transpilePackages: ['ui', 'utils', '@ui/kit'],
    experimental: {
        reactCompiler: true,
        ppr: false,
    },
};

export default nextConfig;
