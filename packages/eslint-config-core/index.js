/* eslint-env: Node */

/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
    parserOptions: {
        sourceType:  'module',
        ecmaVersion: 'latest',
    },
    extends: [ './lib/javascript', './lib/typescript', './lib/react' ],
    rules:   {
        indent:           [ 1, 4 ],
        quotes:           [ 2, 'single' ],
        [ 'no-console' ]: 0,
    },
};
