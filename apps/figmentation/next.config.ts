import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    ppr: false,
    reactCompiler: true,
  },
  reactStrictMode: true,
  transpilePackages: ['ui', 'utils', '@ui/kit'],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
