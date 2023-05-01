/* eslint-env: Node */

/* Instruments */
const complexTs = require('../rules/complex-ts');

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
                './rewires/rewiredStrictRuleSet',
                './rewires/rewiredStylisticRuleSet',
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
                '@typescript-eslint/ban-ts-comment':                complexTs.banTsComment, // ! reduce severity, rewire options
                '@typescript-eslint/consistent-type-definitions':   0, // ! turning off to allow both «type» and «interface»
                '@typescript-eslint/explicit-member-accessibility': 1,
                '@typescript-eslint/member-delimiter-style':        [
                    1,
                    {
                        multiline:          { delimiter: 'comma', requireLast: true },
                        singleline:         { delimiter: 'comma', requireLast: false },
                        multilineDetection: 'brackets',
                    },
                ],
                '@typescript-eslint/member-ordering':               complexTs.memberOrdering,
                '@typescript-eslint/no-duplicate-enum-values':      2, // ! Incresing severity because it was decreased by rewiring
                '@typescript-eslint/no-empty-interface':            [ 1, { allowSingleExtends: true }], // ! Because in default config «allowSingleExtends» is false, and in that case empty interface that extends is replaced by prettier to «type = Extension».
                '@typescript-eslint/no-explicit-any':               [ 1, { fixToUnknown: true }], // ! Because in default config «fixToUnknown» is false, and uknown is better than any
                '@typescript-eslint/no-import-type-side-effects':   1, // ? To enfore «import type» qualifier
                '@typescript-eslint/no-misused-new':                2, // ! Incresing severity because «cosntructor» is better than «new»
                '@typescript-eslint/no-namespace':                  2, // ! Incresing severity because «namespace» is deprecated
                '@typescript-eslint/no-non-null-assertion':         2, // ! Incresing severity because non-null asertion («!») is not recommended (better use «.?» and «??»)
                '@typescript-eslint/no-require-imports':            2, // ? To disallow «require» calls
                '@typescript-eslint/no-this-alias':                 2, // ! Increasing severity because assiging «this» to a local identifier is an outdated practice
                '@typescript-eslint/no-unsafe-declaration-merging': 2, // ! Incresing severity because declaration merging is dangerous
                '@typescript-eslint/no-useless-empty-export':       1, // ? To disallow useless empty exports
                '@typescript-eslint/no-var-requires':               2, // ! Incresing severity because «require» is outdated
                '@typescript-eslint/parameter-properties':          2, // ? To disallow TypeScript's shortstand « constructor(private name: string) »
                '@typescript-eslint/prefer-as-const':               2, // ! increasing severity because «as const» assertion is better than «as 'CONST_ID'»
                '@typescript-eslint/prefer-enum-initializers':      2, // ? To enforce enum initializers
                '@typescript-eslint/prefer-namespace-keyword':      2, // ! Increasing severity because «module» is even more deprecated than «namespace»
                '@typescript-eslint/type-annotation-spacing':       [ 1, { before: false, after: true }], // ? To enforce good looking type annotation statements

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
