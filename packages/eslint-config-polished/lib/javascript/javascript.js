/* eslint-env: Node */
/* Core */
const { resolve } = require('path');

/* Instruments */
const complex = require('../rules/complex-js');

/**
 * @type {import('eslint').Linter.Config<import('eslint').Linter.RulesRecord)>}
 */
module.exports = {
    root:          true,
    extends:       'eslint:recommended',
    parser:        '@babel/eslint-parser',
    parserOptions: {
        sourceType:   'module',
        ecmaFeatures: { ecmaVersion: 'latest', impliedStrict: true },
        babelOptions: {
            configFile: resolve(__dirname, 'babel.config.js'),
        },

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
    // ? - same as above with ! comment — overrides the extended from config or plugin
    // ? - the rest of rules are not extended but new
    rules: {
        // ? ESLint: possible problems
        'array-callback-return':           [ 2, { allowImplicit: true, checkForEach: true }],
        'no-constant-binary-expression':   1,
        'no-constant-condition':           1, // !
        'no-constructor-return':           1,
        'no-duplicate-imports':            1,
        'no-empty-pattern':                1, // !
        'no-inner-declarations':           0, // ! because the rule is designed for < ES6
        'no-new-native-nonconstructor':    2,
        'no-promise-executor-return':      1,
        'no-self-compare':                 2,
        'no-template-curly-in-string':     2,
        'no-unreachable':                  1, // !
        'no-unreachable-loop':             1,
        'no-unused-private-class-members': 1,
        'no-unused-vars':                  1, // !
        'require-atomic-updates':          2,

        // ? ESLint: suggestions
        camelcase:                        1,
        curly:                            [ 1, 'multi', 'consistent' ],
        'default-case':                   2,
        'default-case-last':              1,
        'default-param-last':             1,
        'dot-notation':                   1,
        eqeqeq:                           2,
        'func-name-matching':             2,
        'func-names':                     2,
        'func-style':                     [ 1, 'declaration', { allowArrowFunctions: true }],
        'grouped-accessor-pairs':         [ 1, 'getBeforeSet' ],
        'guard-for-in':                   2,
        'init-declarations':              [ 2, 'always' ],
        'logical-assignment-operators':   [ 1, 'always', { enforceForIfStatements: true }],
        'new-cap':                        2,
        'no-bitwise':                     2,
        'no-caller':                      2,
        'no-confusing-arrow':             1,
        'no-console':                     [ 1, { allow: [ 'warn', 'error' ] }],
        'no-div-regex':                   2,
        'no-else-return':                 1,
        'no-empty-function':              1,
        'no-empty-static-block':          2,
        'no-eq-null':                     2,
        'no-eval':                        2,
        'no-extend-native':               2,
        'no-extra-bind':                  2,
        'no-extra-label':                 1,
        'no-floating-decimal':            1,
        'no-implicit-coercion':           1,
        'no-implicit-globals':            2,
        'no-implied-eval':                2,
        'no-invalid-this':                2,
        'no-iterator':                    2,
        'no-label-var':                   1,
        'no-lone-blocks':                 1,
        'no-lonely-if':                   1,
        'no-loop-func':                   2,
        'no-mixed-operators':             1,
        'no-multi-assign':                2,
        'no-multi-str':                   1,
        'no-negated-condition':           1,
        'no-nested-ternary':              2,
        'no-new':                         1,
        'no-new-func':                    1,
        'no-new-object':                  1,
        'no-new-wrappers':                1,
        'no-octal-escape':                2,
        'no-param-reassign':              [ 2, { props: false }], // ? to allow redux toolkit slices mutate the state param
        'no-proto':                       1,
        'no-return-assign':               2,
        'no-return-await':                1,
        'no-script-url':                  2,
        'no-sequences':                   2,
        'no-undef-init':                  2,
        'no-undefined':                   2,
        'no-underscore-dangle':           complex.noUnderscoreDangle,
        'no-unneeded-ternary':            1,
        'no-unused-expressions':          complex.noUnusedExpressions,
        'no-useless-call':                2,
        'no-useless-computed-key':        1,
        'no-useless-concat':              1,
        'no-useless-constructor':         1,
        'no-useless-rename':              1,
        'no-var':                         2,
        'object-shorthand':               1,
        'one-var':                        [ 2, 'never' ],
        'prefer-arrow-callback':          2,
        'prefer-const':                   2,
        'prefer-destructuring':           0,
        'prefer-exponentiation-operator': 1,
        'prefer-object-has-own':          2,
        'prefer-object-spread':           1,
        'prefer-promise-reject-errors':   2,
        'prefer-rest-params':             2,
        'prefer-spread':                  2,
        'prefer-template':                2,
        'require-await':                  1,
        'spaced-comment':                 [
            1,
            'always',
            {
                line:  { markers: [ '/' ], exceptions: [ '-', '+', '*' ] },
                block: { markers: [ '!' ], exceptions: [ '-', '+', '*' ], balanced: true },
            },
        ],
        strict:               [ 2, 'never' ], // ? "use strcit" is automatically added by bundlers
        'symbol-description': 1,
        yoda:                 1,

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
