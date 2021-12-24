/* Core */
import createWithTm from 'next-transpile-modules';

const withTm = createWithTm([ 'utils' ]);

/**
 * @type {import('next').NextConfig}
 */
const config = {
    reactStrictMode: true,
    async redirects() {
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

export default withTm(config);
