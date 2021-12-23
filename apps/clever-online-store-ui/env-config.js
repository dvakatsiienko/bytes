/* eslint-env node */

const { NODE_ENV } = process.env;

module.exports.envConfig = {
    __ENV__:   NODE_ENV,
    __DEV__:   NODE_ENV === 'development',
    __STAGE__: NODE_ENV === 'stage',
    __PROD__:  NODE_ENV === 'production',
    __TEST__:  NODE_ENV === 'test',
};
