/* eslint-env: Node */

/**
 * @type {import('eslint').Linter.Config<import('eslint').Linter.RulesRecord)>}
 */
module.exports = {
    settings:      { react: { version: 'detect' } },
    parserOptions: { ecmaFeatures: { jsx: true } },
    plugins:       [ 'react', 'react-hooks' ],
    extends:       [ 'plugin:react/recommended' ],
    rules:         {
        // ? React: core
        'react/destructuring-assignment':      0,
        'react/function-component-definition': [
            2,
            { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
        ],
        'react/prefer-stateless-function':     2,
        'react/prop-types':                    0,
        'react/react-in-jsx-scope':            0,
        'react/no-array-index-key':            0,
        'react/no-unescaped-entities':         0,
        'react/no-typos':                      1,
        'react/void-dom-elements-no-children': 1,

        // ? React: JSX
        'react/jsx-curly-spacing':           [ 1, 'always', { spacing: { objectLiterals: 'never' } }],
        'react/jsx-equals-spacing':          [ 1, 'always' ],
        'react/jsx-indent':                  [ 1, 4, { checkAttributes: true, indentLogicalExpressions: true }],
        'react/jsx-filename-extension':      [ 2, { extensions: [ '.js', '.tsx' ] }],
        'react/jsx-indent-props':            [ 1, 4 ],
        'react/jsx-no-useless-fragment':     0,
        'react/jsx-props-no-spreading':      0,
        'react/jsx-one-expression-per-line': 0,
        'react/jsx-sort-props':              [ 1, { shorthandFirst: true, callbacksLast: true }],

        // ? React: hooks
        'react-hooks/rules-of-hooks': 2,
    },
};
