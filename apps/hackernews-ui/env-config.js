/* eslint-env node */

/* eslint-disable-next-line prefer-destructuring */
const NODE_ENV = process.env.NODE_ENV;

module.exports.envConfig = {
    __ENV__:   NODE_ENV,
    __DEV__:   NODE_ENV === 'development',
    __STAGE__: NODE_ENV === 'stage',
    __PROD__:  NODE_ENV === 'production',
    __TEST__:  NODE_ENV === 'test',
};
