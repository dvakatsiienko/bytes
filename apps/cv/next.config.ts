import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { turbopackRustReactCompiler: true, useTypeScriptCli: true },
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ['@ui/kit'],
};

export default nextConfig;
