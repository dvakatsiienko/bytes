/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    root:          true,
    extends:       'polished/typescript',
    // TODO test commenting out «project» to see how «project: true» from «polished/typescript» works
    parserOptions: { project: [ './apps/*/tsconfig.json', './packages/*/tsconfig.json' ]},
    overrides:     [
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
