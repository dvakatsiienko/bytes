/** @type {import('eslint').ESLint.ConfigData} */
module.exports = {
    // root:    true,
    // extends: 'core',
    globals: { $: true },
    rules:   {
        // TODO: move to package config
        // The react/jsx-space-before-closing rule is deprecated. Please use the react/jsx-tag-spacing rule with the "beforeSelfClosing" option instead.

        '@typescript-eslint/no-empty-interface': 0,
        '@typescript-eslint/comma-dangle':       [ 1, 'always-multiline' ],
        '@typescript-eslint/no-shadow':          0,
        // TODO configure this rule to allow missed parameters ... or? not.
        // '@typescript-eslint/no-unused-vars':     0,

        'require-await': [ 1 ],

        'react/require-default-props':                     0, // defaultProps got deprecated, review this rule
        'react/jsx-sort-props':                            1,
        'react/jsx-no-useless-fragment':                   1,
        'react/jsx-one-expression-per-line':               0, // ? off because it is't flexible enough to prettify good looking code
        'jsx-a11y/no-noninteractive-element-interactions': 0,

        'import/no-cycle': 0,

        // TODO configure this rule so prettier formats loo long lines. Exclude comments from linting.
        'max-len':              [ 1, 100 ],
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
