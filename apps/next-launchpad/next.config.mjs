/* Core */
import createWithBundleAnalyzer from '@next/bundle-analyzer';

const withBundleAnalyzer = createWithBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
    defaultSizes: 'gzip',
});

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    images: {
        domains: ['images.unsplash.com'],
    },
};

export default withBundleAnalyzer(nextConfig);
