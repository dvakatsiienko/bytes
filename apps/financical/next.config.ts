/* Core */
import type { NextConfig } from 'next';

// TODO delegate lint and typecheck to turbo
const nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint:          { ignoreDuringBuilds: true },
    typescript:      { ignoreBuildErrors: true },
};

export default nextConfig;
