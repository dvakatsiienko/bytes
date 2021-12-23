/**
 * @type {import('next').NextConfig}
 */
/* Core */
import analyze from '@next/bundle-analyzer';

const withBundleAnalyzer = analyze({
    enabled:      process.env.ANALYZE === 'true',
    defaultSizes: 'gzip',
});

const nextConfig = {
    images: {
        domains: [ 'res.cloudinary.com' ],
    },
    redirects() {
        return [
            {
                source:      '/',
                destination: '/products',
                permanent:   true,
            },
        ];
    },
};

export default withBundleAnalyzer(nextConfig);
