import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { useTypeScriptCli: true },
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ['@ui/kit'],
  typescript: { ignoreBuildErrors: true },
};

export default nextConfig;
