/* Core */
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
    reactStrictMode:   true,
    transpilePackages: [ 'ui', 'utils' ],
};

export default nextConfig;
