/* Core */
import { exec as nodeExec } from 'node:child_process';
import { promisify } from 'node:util';

/* Instruments */
import { envConfig } from './env-config.mjs';

const exec = promisify(nodeExec);

/**
 * @type {import('next').NextConfig}
 */
const nextConfig = {
    i18n:       { locales: [ 'en' ], defaultLocale: 'en' },
    typescript: { ignoreBuildErrors: true },
    eslint:     { ignoreDuringBuilds: true },
    compiler:   {
        styledComponents: {
            ssr:         true,
            cssProp:     false,
            displayName: true,
            fileName:    true,
        },
    },
    webpack: (config, { webpack }) => {
        config.plugins.push(new webpack.DefinePlugin({ ...envConfig }));

        return config;
    },
    redirects () {
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

/* Helpers */
const message1 = '🚀 Starting Next.js.';
const message2 = `🌍 Environment: ${ process.env.NODE_ENV }.`;
let message3 = null;

try {
    const ipconfig = await exec('ipconfig getifaddr en0');

    if (ipconfig.stdout) {
        const machineIpAddress = ipconfig.stdout.replace('\n', '');

        message3 = `📡 Access aplication from the network: http://${ machineIpAddress }:3000`;
    }
} catch (error) {
    message3 = `❌ Error determining machine ip address ${ error }`;
}

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && await import('./src/env.mjs');

console.info(`
    ${ message1 }
    ${ message2 }
    ${ message3 }
`);

process.on('uncaughtException', (err) => {
    console.info('ERR', err);
});

export default nextConfig;
