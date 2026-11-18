import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: { turbopackRustReactCompiler: true, useTypeScriptCli: true },
  reactCompiler: true,
  reactStrictMode: true,
  transpilePackages: ['@ui/kit'],
  turbopack: { rules: { '*.css': { loaders: ['@tailwindcss/turbopack'] } } },
};

export default nextConfig;
