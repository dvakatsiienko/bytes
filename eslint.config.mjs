/* Core */
import polishedConfig from 'eslint-config-polished';

/** @type {import('eslint').Linter.Config[]} */
export default [
    {
        ignores: [
            '**/node_modules/**',
            '**/dist/**',
            '**/.next/**',
            '**/.turbo/**',
            '**/coverage/**',
            '**/storybook-static/**',
            './apps/hackernews',
        ],
    },
    ...polishedConfig,
    {
        ignores: ['**/graphql/**'],
    },
];
