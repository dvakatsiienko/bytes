/* Core */
import pluginJS from '@eslint/js';
import pluginTS from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const js = ['js', 'jsx', 'mjs', 'mjsx', 'cjs', 'cjsx'];
const ts = ['ts', 'tsx', 'mts', 'mtsx', 'cts', 'ctsx'];

export default pluginTS.config(
    // Base ESLint config
    // pluginJS.configs.recommended,

    { ignores: ['**/*.d.ts'] },

    // Base ESLint config for JS/TS files
    {
        files: [`**/*.{${js.join(',')},${ts.join(',')}}`],
        extends: [pluginJS.configs.recommended],
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                React: true,
                __ENV__: true,
                __DEV__: true,
                __STAGE__: true,
                __PROD__: true,
                __TEST__: true,
            },
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        rules: {
            'no-unused-vars': 1,
        },
    },

    // JS-specific rules
    {
        files: [`**/*.{${js.join(',')}}`],
        rules: {
            'no-undef': 2,
        },
    },

    // todo js-only
    // {
    //     files: ['**/*.{' + js.join(',') + '}'],
    //     plugins: { js: pluginJS },
    // },

    // TypeScript: All TS files
    {
        files: ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts', '**/*.mtsx', '**/*.ctsx'],
        languageOptions: {
            parser: pluginTS.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
            },
        },
        plugins: { '@typescript-eslint': pluginTS.plugin },
        rules: {
            // Extend recommended TypeScript rules
            ...pluginTS.configs.recommended.rules,
            ...pluginTS.configs.strict.rules,
            ...pluginTS.configs.stylistic.rules,

            'no-undef': 0, // typescript checks this

            // Override rules from our existing config
            '@typescript-eslint/ban-ts-comment': 'warn',
            '@typescript-eslint/consistent-type-definitions': 'off',
            '@typescript-eslint/explicit-member-accessibility': 'warn',
            '@typescript-eslint/method-signature-style': 'warn',
            '@typescript-eslint/no-duplicate-enum-values': 'error',
            '@typescript-eslint/no-empty-interface': ['warn', { allowSingleExtends: true }],
            '@typescript-eslint/no-explicit-any': ['warn', { fixToUnknown: true }],
            '@typescript-eslint/no-import-type-side-effects': 'warn',
            '@typescript-eslint/no-misused-new': 'error',
            '@typescript-eslint/no-namespace': 'error',
            '@typescript-eslint/no-non-null-assertion': 'error',
            '@typescript-eslint/no-require-imports': 'error',
            '@typescript-eslint/no-this-alias': 'error',
            '@typescript-eslint/no-unsafe-declaration-merging': 'error',
            '@typescript-eslint/no-useless-empty-export': 'warn',
            '@typescript-eslint/no-var-requires': 'error',
            '@typescript-eslint/parameter-properties': 'error',
            '@typescript-eslint/prefer-as-const': 'error',
            '@typescript-eslint/prefer-enum-initializers': 'error',
            '@typescript-eslint/prefer-namespace-keyword': 'error',
        },
    },

    // React JSX files
    {
        files: ['**/*.{jsx,tsx,mjsx,mtjsx,cjsx,ctjsx}'],
        plugins: {
            react: pluginReact,
            'react-hooks': pluginReactHooks,
        },
        settings: { react: { version: 'detect' } },
        rules: {
            'react/react-in-jsx-scope': 0,
            'react/jsx-uses-react': 0,

            'react-hooks/rules-of-hooks': 2,
            'react-hooks/exhaustive-deps': 2,

            // todo review
            'react/jsx-uses-vars': 2,
            'react/boolean-prop-naming': 2,
        },
    },

    {
        files: ['**/*.{js,jsx,ts,tsx}'],
        rules: {
            // quotes: [2, 'single'],
            // 'no-undef': 0, // typescript checks this
        },
    },
);
