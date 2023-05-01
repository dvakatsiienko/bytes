/* eslint-env: Node */
/* Instruments */
const complex = require('./rules/complex-ts');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    overrides: [
        {
            files:   [ '*.ts', '*.tsx', '*.mts', '*.mtsx', '*.cts', '*.ctsx' ],
            extends: [
                // 'plugin:@typescript-eslint/recommended',
                // 'plugin:@typescript-eslint/recommended-type-checked',
                'plugin:@typescript-eslint/strict-type-checked',
                'plugin:@typescript-eslint/stylistic-type-checked',
            ],
            plugins:       [ '@typescript-eslint' ],
            parser:        '@typescript-eslint/parser',
            parserOptions: {
                ecmaVersion:             'latest',
                tsconfigRootDir:         __dirname,
                project:                 true,
                projectFolderIgnoreList: [
                    '**/node_modules/**',
                    '**/.next/**',
                    '**/dist/**',
                    '**/build/**',
                    '**/out/**',
                ],
            },
            rules: {
                'no-undef': 0, // ? ts(2304), extended from eslint-recommended → all shareable configs
                /**
                 * ? Recommended to disable this to save on performance. https://v6--typescript-eslint.netlify.app/linting/troubleshooting/performance-troubleshooting#the-indent--typescript-eslintindent-rules
                 * ? Not included in shareable config.
                 */
                indent:     0,

                // TODO
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
            },
        },
    ],
};
