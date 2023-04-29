/* eslint-env: Node */
const complex = require('../rules/complex-js');

/**
 * @type {import('eslint').Linter.Config<import('eslint').Linter.RulesRecord)>}
 */
module.exports = {
    root:          true,
    extends:       [ 'eslint:recommended', '../rules/eslint-config-airbnb-without-import' ],
    parser:        '@babel/eslint-parser',
    parserOptions: {
        requireConfigFile: false,
        sourceType:        'module',
        ecmaFeatures:      { ecmaVersion: 'latest', impliedStrict: true },

        // TODO support monorepo shape
        // babelOptions: { rootMode: 'upward' },
    },
    env: {
        es2022:                true,
        node:                  true,
        browser:               true,
        'shared-node-browser': true,
    },
    globals: {
        __ENV__:  'readonly',
        __DEV__:  'readonly',
        __PROD__: 'readonly',
        __TEST__: 'readonly',
    },

    // ? any rule value set to:
    // ? - 0 — disables the rule extended from config or plugin
    // ? - 1, 2 or with options — enables the rule
    // ? - same as above with * comment — overrides the extended from config or plugin
    // ? - the rest of rules are not extended but new
    rules: {
        // ? ESLint: possible problems
        'no-duplicate-imports':            [ 2, { includeExports: true }],
        'no-template-curly-in-string':     0,
        'no-unused-private-class-members': 2,
        'no-use-before-define':            0,

        // ? ESLint: suggestions
        'arrow-body-style':       0,
        'class-methods-use-this': 0,
        'consistent-return':      0,
        'func-style':             [ 2, 'declaration', { allowArrowFunctions: true }], // *
        'init-declarations':      [ 2, 'always' ],
        'no-console':             [ 1, { allow: [ 'warn', 'error' ] }], // *
        'no-delete-var':          0,
        'no-negated-condition':   2,
        'no-param-reassign':      [ 2, { props: false }], // * to allow redux toolkit slices mutate the state param
        'no-restricted-syntax':   complex.noRestrictedSyntax, // *
        'no-undefined':           2,
        'no-underscore-dangle':   complex.noUnderscoreDangle, // *
        'no-unused-expressions':  complex.noUnusedExpressions, // *
        'no-void':                0,
        'prefer-destructuring':   0,
        radix:                    [ 2, 'as-needed' ], // *
        'require-await':          2,

        // ? ESLint: layout and formatting
        'array-bracket-newline':       [ 2, 'consistent' ],
        'array-bracket-spacing':       [ 2, 'always', { objectsInArrays: false, arraysInArrays: false }], // *
        'array-element-newline':       [ 2, 'consistent' ],
        'computed-property-spacing':   [ 2, 'always' ], // *
        indent:                        [ 0 ], // ? turned off for performance savings TL;DR: https://tinyurl.com/2p8evbcm
        'jsx-quotes':                  [ 2, 'prefer-single' ], // *
        'key-spacing':                 [ 2, { beforeColon: false, afterColon: true, align: 'value' }], // *
        'lines-between-class-members': [ 2, 'always', { exceptAfterSingleLine: true }], // *
        'max-len':                     complex.maxLen,
        'object-curly-newline':        0,
    },
};
