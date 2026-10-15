import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { turbopackRustReactCompiler: true, useTypeScriptCli: true },
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ['ui', 'utils', '@ui/kit'],
};

export default nextConfig;
