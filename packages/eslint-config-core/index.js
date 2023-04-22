/* eslint-env: Node */

/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
    extends: [ './lib/javascript', './lib/typescript', './lib/react' ],
    rules:   {
        indent: [ 1, 4 ],
        quotes: [ 'error', 'single' ],
    },
};
