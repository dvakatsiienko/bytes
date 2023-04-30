/* eslint-env: Node */

/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
    extends: [ './lib/javascript' ],
    rules:   {
        indent: [ 1, 4 ],
        quotes: [ 2, 'single' ],
    },
};
