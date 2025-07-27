
import withBundleAnalyze from '@next/bundle-analyzer';
import ReactComponentName from 'react-scan/react-component-name/webpack';
import type { NextConfig } from 'next';

const nextConfig = {
    reactStrictMode: true,
    eslint: { ignoreDuringBuilds: true },
    typescript: { ignoreBuildErrors: true },
    transpilePackages: ['jotai-devtools'],
    images: {
        minimumCacheTTL: 60 * 60 * 24 * 7, // 1 week
    },
    redirects: async () => [
        {
            source: '/',
            destination: '/chat',
            permanent: true,
        },
    ],
    experimental: {
        reactCompiler: true,
        // ppr: 'incremental',
        ppr: false,
        taint: true,

        // typedRoutes: true, // ? not supported by turbopack yet
        // dynamicIO: true, // ? seems to be raw yet
    },
    webpack: (config) => {
        config.plugins.push(ReactComponentName({}));
        return config;
    },
} satisfies NextConfig;

const withBundleAnalyzer = withBundleAnalyze({
    enabled: process.env.ANALYZE === 'true',
});

export default withBundleAnalyzer(nextConfig);
