/* Core */
const airbnbBase = require('eslint-config-airbnb-base');

const airbnbConfigWithoutImport = {
    ...airbnbBase,
    extends: airbnbBase.extends.filter((path) => !path.includes('import')),
};

module.exports = airbnbConfigWithoutImport;
