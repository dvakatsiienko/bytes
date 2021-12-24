/* Core */
import createWithTm from 'next-transpile-modules';

const withTm = createWithTm([ 'ui', 'utils' ]);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = { reactStrictMode: true };

export default withTm({ nextConfig });
