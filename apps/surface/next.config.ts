import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    reactCompiler: true,
  },
  reactStrictMode: true,
  transpilePackages: ['@ui/kit'],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
