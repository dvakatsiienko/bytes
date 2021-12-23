/* eslint-env node */

const { envConfig } = require('./env-config.js');

module.exports = (api) => {
    const env = api.env();

    api.cache.using(() => env === 'development');

    return {
        presets: ['next/babel'],
        plugins: [
            ['styled-components', { ssr: true }],
            ['transform-define', envConfig],
        ],
    };
};
