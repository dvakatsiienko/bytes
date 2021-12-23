const { envConfig } = require('./env-config.js');

module.exports = api => {
    const env = api.env();

    api.cache.using(() => env === 'development');

    const presets = [];

    if (env === 'test') {
        presets.push([ 'next/babel', { 'preset-env': { modules: 'commonjs' } }]);
    } else {
        presets.push('next/babel');
    }

    return {
        presets,
        plugins: [
            [ 'styled-components', { ssr: true }],
            [ 'transform-define', envConfig ],
        ],
    };
};
