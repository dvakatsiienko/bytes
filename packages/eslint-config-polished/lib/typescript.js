/* eslint-env: Node */

/* Instruments */
const complex = require('./rules/complex-ts');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    overrides: [
        {
            files: [ '*.ts', '*.tsx', '*.mts', '*.mtsx', '*.cts', '*.ctsx' ],

            parser:        '@typescript-eslint/parser',
            parserOptions: {
                // ?
                ecmaVersion: 'latest',
                lib:         [ 'DOM', 'DOM.Iterable', 'ESNext' ],
            },

            extends: [
                /**
                 * ? Extended by default in plugin:@typescript-eslint/{strict,stylistic}.
                 * ? Adeed manually because «strict» and «stylistic» rule sets was rewired by reducing rule severity from «error» to 1 (warning).
                 */
                'plugin:@typescript-eslint/base',
                'plugin:@typescript-eslint/eslint-recommended',

                // ? Rewired «strict» and «stylistic» rule sets.
                './rewiredStrictRuleSet',
                './rewiredStylisticRuleSet',
            ],
            plugins: [ '@typescript-eslint' ],

            /**
             * ? any rule value set to:
             * ? - 0 — disables the rule extended from config or plugin
             * ? - 1, 2 or with options — enables the rule
             * ? - same as above with «!» comment — overrides the extended from config or plugin
             * ? - the rest of rules are not extended but new
             */
            rules: {
                'no-undef': 0, // ? ts(2304), extended from eslint-recommended → all shareable configs
                /**
                 * ? Recommended to disable this to save on performance. https://v6--typescript-eslint.netlify.app/linting/troubleshooting/performance-troubleshooting#the-indent--typescript-eslintindent-rules
                 * ? Not included in shareable config.
                 */
                indent:     0,

                // ? TpyeScript Rules
                '@typescript-eslint/ban-ts-comment': [
                    // ! reduce severity, rewire options
                    1,
                    {
                        'ts-expect-error': 'allow-with-description',
                        'ts-ignore':       'allow-with-description',
                        'ts-nocheck':      true,
                        'ts-check':        true,
                    },
                ],

                // TODO process old config
                // '@typescript-eslint/no-empty-interface': 0,
                // '@typescript-eslint/comma-dangle':       [ 1, 'always-multiline' ],
                // '@typescript-eslint/no-shadow':          0,
                // TODO configure this rule to allow missed parameters ... or? not.
                // '@typescript-eslint/no-unused-vars':     0,
                // ? Rules
                // '@typescript-eslint/explicit-module-boundary-types': 0,
                // '@typescript-eslint/ban-ts-comment':                 complex.banTsComment,
                // '@typescript-eslint/consistent-type-assertions':     [ 2, { assertionStyle: 'as' }],
                // '@typescript-eslint/member-delimiter-style':         2,
                // '@typescript-eslint/method-signature-style':         2,
                // '@typescript-eslint/no-require-imports':             2,
                // '@typescript-eslint/prefer-optional-chain':          2,
                // ? Extension Rules
                // 'brace-style':                    0,
                // '@typescript-eslint/brace-style': 2,
                // 'comma-dangle': 0,
                // '@typescript-eslint/comma-dangle': [ 2, complex.commaDangleRuleOpts ],
                // 'comma-spacing':                    0,
                // '@typescript-eslint/comma-spacing': 2,
                // 'default-param-last':                    0,
                // '@typescript-eslint/default-param-last': 2,
                // 'init-declarations':                    0,
                // '@typescript-eslint/init-declarations': [ 2, 'always' ],
                // 'no-dupe-class-members':                    0,
                // '@typescript-eslint/no-dupe-class-members': 2,
                // 'no-duplicate-imports':                    0,
                // '@typescript-eslint/no-duplicate-imports': [ 2, { includeExports: true }],
                // 'no-shadow':                    0,
                // '@typescript-eslint/no-shadow': 2,
                // quotes:                      0,
                // '@typescript-eslint/quotes': [ 2, 'single' ],

                // TODO process typescript-eslint's configs/eslint-recommended
                // 'constructor-super': 'off', // ts(2335) & ts(2377)
                // 'getter-return': 'off', // ts(2378)
                // 'no-const-assign': 'off', // ts(2588)
                // 'no-dupe-args': 'off', // ts(2300)
                // 'no-dupe-class-members': 'off', // ts(2393) & ts(2300)
                // 'no-dupe-keys': 'off', // ts(1117)
                // 'no-func-assign': 'off', // ts(2539)
                // 'no-import-assign': 'off', // ts(2539) & ts(2540)
                // 'no-new-symbol': 'off', // ts(7009)
                // 'no-obj-calls': 'off', // ts(2349)
                // 'no-redeclare': 'off', // ts(2451)
                // 'no-setter-return': 'off', // ts(2408)
                // 'no-this-before-super': 'off', // ts(2376)
                // 'no-undef': 'off', // ts(2304)
                // 'no-unreachable': 'off', // ts(7027)
                // 'no-unsafe-negation': 'off', // ts(2365) & ts(2360) & ts(2358)
                // 'no-var': 'error', // ts transpiles let/const to var, so no need for vars any more
                // 'prefer-const': 'error', // ts provides better types with const
                // 'prefer-rest-params': 'error', // ts provides better types with rest args over arguments
                // 'prefer-spread': 'error', // ts transpiles spread to apply, so no need for manual apply
            },
        },
    ],
};
