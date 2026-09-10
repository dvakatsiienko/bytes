import type { NextConfig } from 'next';

const nextConfig = {
  experimental: { turbopackRustReactCompiler: true, useTypeScriptCli: true },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
  },
  reactCompiler: true,
  reactStrictMode: true,
  redirects: async () => [
    {
      destination: '/chat',
      permanent: true,
      source: '/',
    },
  ],
  transpilePackages: ['@ui/kit', 'jotai-devtools'],
  turbopack: {}, // Acknowledge Turbopack usage (webpack config below will be ignored)
  typedRoutes: true, // todo test it out
} satisfies NextConfig;

export default nextConfig;
