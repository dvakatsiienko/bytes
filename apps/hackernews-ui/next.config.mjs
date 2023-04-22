/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode:   true,
    transpilePackages: [ 'utils' ],
    redirects() {
        return [
            {
                source:      '/user',
                destination: '/new/1',
                permanent:   true,
            },
            {
                source:      '/new',
                destination: '/new/1',
                permanent:   true,
            },
        ];
    },
};

export default nextConfig;
