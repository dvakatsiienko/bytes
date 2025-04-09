/* Core */
import polishedConfig from 'eslint-config-polished';

/** @type {import('eslint').Linter.Config[]} */
export default [
    ...polishedConfig,
    {
        name: 'root-config/ignores',
        ignores: ['./apps/hackernews', '**/graphql/**'],
    },
];
