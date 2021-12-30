exports.functionComponentDefinition = [
    2,
    {
        namedComponents:   [ 'arrow-function', 'function-declaration' ],
        unnamedComponents: 'arrow-function',
    },
];

exports.jsxCurlySpacing = [ 2, { when: 'always', spacing: { objectLiterals: 'never' } }];

exports.jsxIdent = [ 1, 4, { checkAttributes: true, indentLogicalExpressions: true }];

exports.jsxSortProps = [
    2,
    {
        callbacksLast:        true,
        shorthandFirst:       true,
        shorthandLast:        false,
        noSortAlphabetically: false,
        reservedFirst:        true,
    },
];
