/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    root:      true,
    extends:   'polished/typescript',
    overrides: [
        // ? apps
        {
            files: [
                './apps/hackernews/**/*{.ts,.tsx}',
                './apps/space-explorer-ui/**/*{.ts,.tsx}',
                './apps/basic-*/**/*{.ts,.tsx}',
            ],
            extends: 'polished/react',
        },

        // ? pacakges
        {
            files:   [ './packages/eslint-config-polished/**/*.js' ],
            extends: 'polished/javascript',
        },
        {
            files:   [ './packages/ui/**/*{.ts,.tsx}' ],
            extends: 'polished/react',
        },
    ],
};
