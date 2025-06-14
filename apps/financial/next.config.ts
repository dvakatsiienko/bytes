/* Core */
import type { NextConfig } from 'next';
import dotenv from 'dotenv';

dotenv.config({
    path: '.env',
});

const nextConfig: NextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
