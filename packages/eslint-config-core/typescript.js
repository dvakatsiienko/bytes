/* eslint-env: Node */

const complex = require('./rules/complex-ts');

/**
 * @type {import('eslint').Linter.Config<import('eslint').Linter.RulesRecord)>}
 */
module.exports = {
    overrides: [
        {
            parser:  '@typescript-eslint/parser',
            plugins: [ '@typescript-eslint' ],
            files:   [ '*.ts', '*.tsx' ],
            extends: [ 'plugin:@typescript-eslint/recommended' ],
            rules:   {
                // ? TypeScript-ESLint
                '@typescript-eslint/explicit-module-boundary-types': 0,
                '@typescript-eslint/ban-ts-comment':                 complex.banTsComment,
                '@typescript-eslint/consistent-type-assertions':     [ 2, { assertionStyle: 'as' }],
                '@typescript-eslint/member-delimiter-style':         2,
                '@typescript-eslint/method-signature-style':         2,
                '@typescript-eslint/no-require-imports':             2,
                '@typescript-eslint/prefer-optional-chain':          2,
            },
        },
    ],
};
