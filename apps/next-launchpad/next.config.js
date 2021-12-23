/* eslint-env node */

const analyze = require('@next/bundle-analyzer');

const withBundleAnalyzer = analyze({
    enabled:      process.env.ANALYZE === 'true',
    defaultSizes: 'gzip',
});

const nextConfig = {
    images: {
        domains: [ 'images.unsplash.com' ],
    },
};

module.exports = withBundleAnalyzer(nextConfig);
