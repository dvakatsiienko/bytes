/* Core */
import pluginJS from '@eslint/js';
import pluginTS from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import pluginReactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';

const extEsmJSX = ['jsx', 'mjsx'];
const extEsmTSX = ['tsx', 'mtsx'];
const extCjsJSX = ['cjsx'];
const extCjsTSX = ['ctsx'];
const extEsmJS = ['js', 'mjs'];
const extEsmTS = ['ts', 'mts'];
const extCJS = ['cjs'];
const extCTS = ['cts'];

const extJSX = [...extEsmJSX, ...extCjsJSX];
const extTSX = [...extEsmTSX, ...extCjsTSX];
const extJS = [...extEsmJS, ...extCJS, ...extEsmJSX, ...extCjsJSX];
const extTS = [...extEsmTS, ...extCTS, ...extEsmTSX, ...extCjsTSX];

// const extEsmJSGlob = `**/*.{${extEsmJS.join(',')}}`;
// const extEsmTSGlob = `**/*.{${extEsmTS.join(',')}}`;
// const extCjsGlob = `**/*.{${extCJS.join(',')}}`;
// const extCtsGlob = `**/*.{${extCTS.join(',')}}`;

const extJSXGlob = `**/*.{${extJSX.join(',')}}`;
const extTSXGlob = `**/*.{${extTSX.join(',')}}`;

const extJSGlob = `**/*.{${extJS.join(',')}}`;
const extTSGlob = `**/*.{${extTS.join(',')}}`;

export default pluginTS.config(
    {
        name: 'eslint-config-polished/ignores-global',
        ignores: [
            '**/dist/**',
            '**/.next/**',
            '**/.turbo/**',
            '**/coverage/**',
            '**/storybook-static/**',
            '**/*.d.ts',
            '**/**/prisma-client/**',
        ],
    },

    {
        name: 'eslint-config-polished/base-recommended',
        files: [extJSGlob, extTSGlob],
        plugins: { js: pluginJS },
        extends: [pluginJS.configs.recommended],
        linterOptions: {
            // todo check for .ts, .tsx etc
            reportUnusedDisableDirectives: 1,
            reportUnusedInlineConfigs: 1,
        },
        languageOptions: {
            globals: {
                ...globals.browser,
                ...globals.node,
                React: 'readonly',
                __ENV__: 'readonly',
                __DEV__: 'readonly',
                __STAGE__: 'readonly',
                __PROD__: 'readonly',
                __TEST__: 'readonly',
            },
            parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
        },
        rules: {
            /* Possible problems */
            'no-duplicate-imports': [1, { includeExports: true }],
            'no-irregular-whitespace': 1,
            'no-promise-executor-return': 2,
            'no-self-compare': 2,
            'no-template-curly-in-string': 2,
            'no-unmodified-loop-condition': 2,
            'no-unreachable': 1,
            'no-unreachable-loop': 2,
            'no-unused-vars': 1,
            'no-useless-assignment': 1,
            'require-atomic-updates': 2,
        },
    },

    // todo split no-unused-vars for .ts, .tsx etc

    {
        name: 'eslint-config-polished/typescript',
        files: [extTSGlob],
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

    {
        name: 'eslint-config-polished/react',
        files: [extJSXGlob, extTSXGlob],
        plugins: {
            react: pluginReact,
            'react-hooks': pluginReactHooks,
        },
        settings: { react: { version: 'detect' } },
        languageOptions: {
            parserOptions: {
                ecmaFeatures: {
                    jsx: true, // todo check if needed
                },
            },
        },

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
);
