import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    reactCompiler: true,
  },
  reactStrictMode: true,
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
