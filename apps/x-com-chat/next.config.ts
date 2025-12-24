import type { NextConfig } from 'next';

const nextConfig = {
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
  transpilePackages: ['jotai-devtools'],
  turbopack: {}, // Acknowledge Turbopack usage (webpack config below will be ignored)
  typedRoutes: true, // todo test it out
  typescript: { ignoreBuildErrors: true },
} satisfies NextConfig;

export default nextConfig;
