import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ['ui', 'utils', '@ui/kit'],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
