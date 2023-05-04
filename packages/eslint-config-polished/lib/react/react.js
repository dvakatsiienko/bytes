/* eslint-env: Node */

/* Instruments */
const complexReactRules = require('./complex-react-rules');

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
    overrides: [
        {
            files: [ '*.tsx', '*.jsx', '*.js' ],

            parserOptions: { ecmaFeatures: { jsx: true }},
            settings:      { react: { version: 'detect' }, ecmaFeatures: { jsx: true }},

            plugins: [ 'react', 'react-hooks' ],
            extends: [ 'plugin:react/jsx-runtime' ],

            globals: { React: true },

            rules: {
                // TODO: move to package config
                // 'react/require-default-props':                     0, // defaultProps got deprecated, review this rule
                // 'react/jsx-sort-props':                            1,
                // 'react/jsx-no-useless-fragment':                   1,
                // 'jsx-a11y/no-noninteractive-element-interactions': 0,

                // ? React: hooks
                'react-hooks/rules-of-hooks':  2,
                'react-hooks/exhaustive-deps': 0,

                // ? React: core
                'react/boolean-prop-naming':               [ 1, { validateNested: true }],
                'react/function-component-definition':     complexReactRules.fnComponentDefinition,
                'react/hook-use-state':                    1,
                'react/iframe-missing-sandbox':            2,
                'react/jsx-boolean-value':                 1,
                'react/jsx-child-element-spacing':         1,
                'react/jsx-closing-bracket-location':      [ 2, 'line-aligned' ],
                'react/jsx-closing-tag-location':          1,
                'react/jsx-curly-brace-presence':          [ 1, 'never' ],
                'react/jsx-curly-newline':                 1,
                'react/jsx-curly-spacing':                 complexReactRules.jsxCurlySpacing,
                'react/jsx-equals-spacing':                [ 1, 'always' ],
                'react/jsx-filename-extension':            [ 2, { extensions: [ '.tsx', '.js' ]}],
                'react/jsx-first-prop-new-line':           1,
                'react/jsx-fragments':                     1,
                'react/jsx-handler-names':                 complexReactRules.jsxHandlernames,
                'react/jsx-indent':                        complexReactRules.jsxIdent,
                'react/jsx-indent-props':                  [ 1, 4 ],
                'react/jsx-key':                           [ 2, { checkFragmentShorthand: true }],
                'react/jsx-max-props-per-line':            [ 1, { when: 'multiline', maximum: 1 }],
                'react/jsx-no-comment-textnodes':          2,
                'react/jsx-no-constructed-context-values': 2,
                'react/jsx-no-duplicate-props':            2,
                'react/jsx-no-leaked-render':              2,
                'react/jsx-no-script-url':                 2,
                'react/jsx-no-target-blank':               2,
                'react/jsx-no-undef':                      2,
                'react/jsx-no-useless-fragment':           [ 1, { allowExpressions: true }], // TODO REVIEW. allowExressions is a workaroud, because currntly @types/react is working wrong disallowing singular strings to be returned from a component. https://github.com/microsoft/TypeScript/issues/21699
                'react/jsx-pascal-case':                   2,
                'react/jsx-props-no-multi-spaces':         1,
                'react/jsx-sort-props':                    complexReactRules.jsxSortProps,
                'react/jsx-tag-spacing':                   complexReactRules.tagSpacing,
                'react/jsx-uses-vars':                     1,
                'react/jsx-wrap-multilines':               complexReactRules.wrapMultilines,
                'react/no-array-index-key':                2,
                'react/no-children-prop':                  2,
                'react/no-danger':                         2,
                'react/no-danger-with-children':           2,
                'react/no-deprecated':                     2,
                'react/no-invalid-html-attribute':         2,
                'react/no-namespace':                      2,
                'react/no-render-return-value':            2,
                'react/no-string-refs':                    2,
                'react/no-this-in-sfc':                    2,
                'react/no-unknown-property':               [ 2, { ignore: [ 'css' ]}],
                'react/no-unstable-nested-components':     2,
                'react/prefer-es6-class':                  [ 2, 'never' ],
                'react/prefer-stateless-function':         2,
                'react/require-render-return':             2,
                'react/self-closing-comp':                 1,
                'react/sort-default-props':                1,
                'react/style-prop-object':                 2,
                'react/void-dom-elements-no-children':     2,
            },
        },
    ],
};
