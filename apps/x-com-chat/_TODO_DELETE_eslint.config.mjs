// @ts-check

/* Core */
import pluginEslint from '@eslint/js';
import pluginTypescript from 'typescript-eslint';
import pluginReact from 'eslint-plugin-react';
import * as pluginReactHooks from 'eslint-plugin-react-hooks';

export default pluginTypescript.config(
    { ignores: ['.next', 'convex/_generated'] },

    {
        files: ['**/*.{js,jsx,mjs}'],
        extends: [pluginEslint.configs.recommended],
        rules: {
            'no-unused-vars': 1,
        },
    },

    {
        files: ['**/*.{tsx,jsx}'],
        plugins: { react: pluginReact },
        extends: [pluginReactHooks.configs.recommended],
    },

    {
        files: ['**/*.{ts,tsx}'],
        extends: [pluginTypescript.configs.recommended],
        rules: {
            '@typescript-eslint/no-unused-vars': 1,
        },
    },
);
