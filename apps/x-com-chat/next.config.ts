import withBundleAnalyze from '@next/bundle-analyzer';
import type { NextConfig } from 'next';
import ReactComponentName from 'react-scan/react-component-name/webpack';

const nextConfig = {
  eslint: { ignoreDuringBuilds: true },
  experimental: {
    // ppr: 'incremental',
    ppr: false,
    reactCompiler: true,
    taint: true,

    // typedRoutes: true, // ? not supported by turbopack yet
    // dynamicIO: true, // ? seems to be raw yet
  },
  images: {
    minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
  },
  reactStrictMode: true,
  redirects: async () => [
    {
      destination: '/chat',
      permanent: true,
      source: '/',
    },
  ],
  transpilePackages: ['jotai-devtools'],
  typedRoutes: true, // todo test it out
  typescript: { ignoreBuildErrors: true },
  webpack: (config) => {
    config.plugins.push(ReactComponentName({}));
    return config;
  },
} satisfies NextConfig;

const withBundleAnalyzer = withBundleAnalyze({
  enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
