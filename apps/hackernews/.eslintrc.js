/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
    extends: 'dva',
    globals: { $: true },
    rules:   {
        // TODO: move to package config
        '@typescript-eslint/no-empty-interface': 0,

        'react/require-default-props':                     0, // defaultProps got deprecated, review this rule
        'jsx-a11y/no-noninteractive-element-interactions': 0,

        'import/no-cycle': 0,

        'arrow-parens':         [ 1, 'always' ],
        'key-spacing':          [ 1, { beforeColon: false, afterColon: true, align: 'value' }],
        'object-curly-newline': [
            1,
            {
                ObjectExpression:  { multiline: true },
                ObjectPattern:     { multiline: true },
                ImportDeclaration: { multiline: true },
                ExportDeclaration: { multiline: true },
            },
        ],
        'prefer-destructuring': 0,
        camelcase:              [ 1, { allow: [ '^unstable_', 'grant_type', 'access_token', 'refresh_token' ] }],
    },
};
