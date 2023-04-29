/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    reactStrictMode:   true,
        transpilePackages: [ 'ui', 'utils' ],
};

export default nextConfig;
