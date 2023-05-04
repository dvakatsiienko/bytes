/* eslint-env: Node */

/* Instruments */
const complexTsRules = require('./complex-ts-rules');
const { getJsRule } = require('./getJsRule');

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
                'plugin:@typescript-eslint/base', // ? Base config do not contain any rules: no need to rewire.

                /**
                 * ? Recommended config ix extended by default in plugin:@typescript-eslint/{strict,stylistic}.
                 * ? «strict» and «stylistic» rule sets was rewired by reducing rule severity from «error» to 1 (warning).
                 * ? During rewiring «extends» field is dropped.
                 * ? Thus adding rewired version of «recommended» manually. (recommended is rewired also!)
                 */
                './rewires/rewiredRecommendedRuleSet',

                /**
                 * ? Rewired «strict» and «stylistic» rule sets.
                 */
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
                // ? TypeScript Rules
                '@typescript-eslint/ban-ts-comment':                complexTsRules.banTsComment, // ! reduce severity, rewire options
                '@typescript-eslint/consistent-type-definitions':   0, // ! turning off to allow both «type» and «interface»
                '@typescript-eslint/explicit-member-accessibility': 1,
                '@typescript-eslint/member-ordering':               complexTsRules.memberOrdering,
                '@typescript-eslint/method-signature-style':        1,
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

                // ? Extension Rules
                'default-param-last':                        1,
                '@typescript-eslint/default-param-last':     getJsRule('default-param-last'),
                'init-declarations':                         0,
                '@typescript-eslint/init-declarations':      getJsRule('init-declarations'),
                'no-multi-spaces':                           0, // ? Disabled because it conflicts with «@typescript-eslint/key-spacing» and there is no corresponding override rule in «@typescript-eslint/key-spacing»
                '@typescript-eslint/no-array-constructor':   0, // ! Turn off because I don't use this rule in JavaScript rule set
                'no-dupe-class-members':                     0,
                '@typescript-eslint/no-dupe-class-members':  2, // ! Increase severity because duplicating class member is dangerous. Not declared literally in JS config (extended from eslint-recommended), thus not using getJsRule.
                'no-extra-semi':                             0,
                '@typescript-eslint/no-extra-semi':          1, // ? Not declared literally in JS config (extended from eslint-recommended), thus not using getJsRule.
                'no-invalid-this':                           0,
                '@typescript-eslint/no-invalid-this':        getJsRule('no-invalid-this'),
                'no-loop-func':                              0,
                '@typescript-eslint/no-loop-func':           getJsRule('no-loop-func'),
                'no-loss-of-precision':                      0,
                '@typescript-eslint/no-loss-of-precision':   2, // ! Increase severity because loosing precision is dangerous. Not declared literally in JS config (extended from eslint-recommended), thus not using getJsRule
                'no-redeclare':                              0,
                '@typescript-eslint/no-redeclare':           2, // ? Not declared literally in JS config (extended from eslint-recommended), thus not using getJsRule.
                'no-unused-expressions':                     0,
                '@typescript-eslint/no-unused-expressions':  getJsRule('no-unused-expressions'),
                'no-unused-vars':                            0,
                '@typescript-eslint/no-unused-vars':         getJsRule('no-unused-vars'),
                'no-useless-constructor':                    0,
                '@typescript-eslint/no-useless-constructor': getJsRule('no-useless-constructor'),

                // ? Formatting Rules (Probably delegate them to Prettier)
                'block-spacing':                                  0,
                '@typescript-eslint/block-spacing':               getJsRule('block-spacing'),
                'brace-style':                                    0,
                '@typescript-eslint/brace-style':                 getJsRule('brace-style'),
                'comma-dangle':                                   0,
                '@typescript-eslint/comma-dangle':                getJsRule('comma-dangle'),
                'comma-spacing':                                  0,
                '@typescript-eslint/comma-spacing':               getJsRule('comma-spacing'),
                'func-call-spacing':                              0,
                '@typescript-eslint/func-call-spacing':           getJsRule('func-call-spacing'),
                /**
                 * ? Recommended to disable this to save on performance. https://v6--typescript-eslint.netlify.app/linting/troubleshooting/performance-troubleshooting#the-indent--typescript-eslintindent-rules
                 * ? Not included in shareable config.
                 * * probably turn off for performance savings TL;DR: https://tinyurl.com/2p8evbcm
                 */
                indent:                                           0,
                '@typescript-eslint/indent':                      getJsRule('indent'),
                'key-spacing':                                    0,
                '@typescript-eslint/key-spacing':                 getJsRule('key-spacing'),
                'keyword-spacing':                                1,
                '@typescript-eslint/keyword-spacing':             getJsRule('keyword-spacing'),
                'lines-between-class-members':                    0,
                '@typescript-eslint/lines-between-class-members': JSON.parse(JSON.stringify(getJsRule('lines-between-class-members'))), // ? Deep-cloned via JSON.stringify/parse becase «@typescript-eslint»'s equivalent of the rule adds additional rule option «exceptAfterOverload» which is being injected into the object, and gets passed back to ESLint's javascript config, thus breaking it. Because it is a single object, and it is working with reference.
                '@typescript-eslint/member-delimiter-style':      complexTsRules.memberDelimiterStyle, // ? Does not have ESLint equivalent
                'no-extra-parens':                                0,
                '@typescript-eslint/no-extra-parens':             getJsRule('no-extra-parens'),
                'object-curly-spacing':                           0,
                '@typescript-eslint/object-curly-spacing':        getJsRule('object-curly-spacing'),
                'padding-line-between-statements':                0,
                '@typescript-eslint/padding-line-between-statements':
                    complexTsRules.paddingLineBetweenStatements,
                quotes:                                           0,
                '@typescript-eslint/quotes':                      getJsRule('quotes'),
                semi:                                             0,
                '@typescript-eslint/semi':                        getJsRule('semi'),
                'space-before-blocks':                            0,
                '@typescript-eslint/space-before-blocks':         getJsRule('space-before-blocks'),
                'space-before-function-paren':                    0,
                '@typescript-eslint/space-before-function-paren': getJsRule('space-before-function-paren'),
                'space-infix-ops':                                0,
                '@typescript-eslint/space-infix-ops':             getJsRule('space-infix-ops'),
                // ? To enforce good looking type annotation statements
                '@typescript-eslint/type-annotation-spacing':     complexTsRules.typeAnnotationSpacing,
            },
        },
    ],
};
