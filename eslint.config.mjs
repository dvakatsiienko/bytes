import polishedConfig from 'eslint-config-polished';

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...polishedConfig,
  {
    ignores: ['**/graphql/**', '**/prisma/migrations/**', '**/.generated/**'],
    name: 'root-config/ignores',
  },
];
