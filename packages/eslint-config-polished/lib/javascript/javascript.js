/* eslint-env: Node */

/* Core */
const { resolve } = require('node:path');

/* Instruments */
const comlexJsRules = require('./complex-js-rules');

/**
 * @type {import('eslint').Linter.Config<import('eslint').Linter.RulesRecord)>}
 */
module.exports = {
    overrides: [
        {
            files: [ '*.js', '*.mjs', '*.cjs' ],

            parser: '@babel/eslint-parser',

            parserOptions: {
                sourceType:   'module',
                ecmaFeatures: { ecmaVersion: 'latest', impliedStrict: true },
                babelOptions: { configFile: resolve(__dirname, 'babel.config.js') },

                // TODO support monorepo shape
                // babelOptions: { rootMode: 'upward' },
            },

            extends: 'eslint:recommended',
            plugins: [ 'smells' ],

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

            /**
             * ? any rule value set to:
             * ? - 0 — disables the rule extended from config or plugin
             * ? - 1, 2 or with options — enables the rule
             * ? - same as above with «!» comment — overrides the extended from config or plugin
             * ? - the rest of rules are not extended but new
             */
            rules: {
                // TODO connect next eslint

                // ? eslint-plugin-smells
                'smells/no-switch': 2,

                // ? ESLint: possible problems
                'array-callback-return':           [ 2, { allowImplicit: true, checkForEach: true }],
                'no-constant-binary-expression':   1,
                'no-constant-condition':           1, // ! Decreasing severity, because constant conditions are not so dangerous and sometimes may be useful
                'no-constructor-return':           1,
                'no-duplicate-imports':            1,
                'no-empty-pattern':                1, // ! Decreasing severity, because empty patterns are not so dangerous
                'no-inner-declarations':           0, // ! because the rule is designed for < ES6
                'no-new-native-nonconstructor':    2,
                'no-promise-executor-return':      1,
                'no-self-compare':                 2,
                'no-template-curly-in-string':     2,
                'no-unreachable':                  1, // ! Decreasing severity, because unreachable code is not so dangerous
                'no-unreachable-loop':             1,
                'no-unused-private-class-members': 1,
                'no-unused-vars':                  1, // ! Decreasing severity, because unused vars are not so dangerous.
                'require-atomic-updates':          2,

                // ? ESLint: suggestions
                camelcase: [
                    1,
                    { allow: [ '^unstable_', 'grant_type', 'access_token', 'refresh_token' ]},
                ],
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
                'no-console':                     [ 1, { allow: [ 'warn', 'error', 'info' ]}],
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
                'no-underscore-dangle':           comlexJsRules.noUnderscoreDangle,
                'no-unneeded-ternary':            1,
                'no-unused-expressions':          comlexJsRules.noUnusedExpressions,
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
                'spaced-comment':                 comlexJsRules.spacedComment,
                strict:                           [ 2, 'never' ], // ? "use strcit" is automatically added by bundlers
                'symbol-description':             1,
                yoda:                             1,

                // ? ESLint: layout and formatting
                // * Formatting-related rules should be delegated to Prettier probably
                'array-bracket-newline': [ 2, 'consistent' ],
                'array-bracket-spacing': [
                    2,
                    'always',
                    { objectsInArrays: false, arraysInArrays: false },
                ],
                'array-element-newline':            [ 2, 'consistent' ],
                'arrow-parens':                     1,
                'arrow-spacing':                    1,
                'block-spacing':                    1,
                'brace-style':                      [ 1, '1tbs', { allowSingleLine: true }],
                'comma-dangle':                     [ 1, 'always-multiline' ],
                'comma-spacing':                    [ 1, { before: false, after: true }],
                'comma-style':                      [ 1, 'last' ],
                'computed-property-spacing':        [ 1, 'always' ],
                'dot-location':                     [ 1, 'property' ],
                'eol-last':                         [ 1, 'always' ],
                'func-call-spacing':                [ 1, 'never' ],
                'function-call-argument-newline':   [ 1, 'consistent' ],
                'function-paren-newline':           [ 1, 'multiline' ],
                'generator-star-spacing':           [ 1, { before: false, after: true }],
                'implicit-arrow-linebreak':         [ 1, 'beside' ],
                indent:                             [ 1, 4 ],
                'jsx-quotes':                       [ 1, 'prefer-single' ],
                'key-spacing':                      [ 1, { align: 'value' }],
                'keyword-spacing':                  1,
                'linebreak-style':                  1,
                'lines-between-class-members':      [ 1, 'always', { exceptAfterSingleLine: true }],
                // 'max-len':                          comlexJsRules.maxLen, // ? Disabled because of other formatting rules in combination with prettier-eslint haver higher formatting precendence which leads to this rule being omitted. Probably enable in future.
                'max-statements-per-line':          [ 1, { max: 1 }],
                'multiline-ternary':                [ 1, 'always-multiline' ],
                'new-parens':                       [ 1, 'always' ],
                'no-extra-parens':                  [ 1, 'all', { ignoreJSX: 'multi-line' }],
                'no-multi-spaces':                  [ 1, { ignoreEOLComments: true, exceptions: { Property: true }}],
                'no-multiple-empty-lines':          [ 1, { max: 1 }],
                'no-tabs':                          1,
                'no-trailing-spaces':               1,
                'no-whitespace-before-property':    1,
                'nonblock-statement-body-position': 1,
                'object-curly-newline':             [ 1, { multiline: true }],
                'object-curly-spacing':             comlexJsRules.objectCurlySpacing,
                'operator-linebreak':               [ 1, 'before', { overrides: { '=': 'after' }}],
                'padding-line-between-statements':  comlexJsRules.paddingLineBetweenStatements,
                quotes:                             [ 1, 'single' ],
                'rest-spread-spacing':              1,
                semi:                               [ 1, 'always' ],
                'semi-spacing':                     [ 1, { before: false, after: true }],
                'semi-style':                       [ 1, 'last' ],
                'space-before-blocks':              1,
                'space-before-function-paren':      [ 1, 'always' ],
                'space-in-parens':                  [ 1, 'never' ],
                'space-infix-ops':                  1,
                'space-unary-ops':                  1,
                'switch-colon-spacing':             1,
                'template-curly-spacing':           [ 1, 'always' ],
                'template-tag-spacing':             1,
                'wrap-iife':                        [ 1, 'inside' ],
                'yield-star-spacing':               [ 1, 'after' ],

                // TODO eslint-plugin-import
                'import/no-cycle': 0,
                // ? https://v6--typescript-eslint.netlify.app/linting/troubleshooting/performance-troubleshooting#eslint-plugin-import
                // We recommend you do not use the following rules, as TypeScript provides the same checks as part of standard type checking:

                // import/named
                // import/namespace
                // import/default
                // import/no-named-as-default-member
                // The following rules do not have equivalent checks in TypeScript, so we recommend that you only run them at CI/push time, to lessen the local performance burden.

                // import/no-named-as-default
                // import/no-cycle
                // import/no-unused-modules
                // import/no-deprecated

                // TODO eslint-plugin-prettier
            },
        },
    ],
};
