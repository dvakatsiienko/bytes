exports.fnComponentDefinition = [
    1,
    { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
];

exports.jsxCurlySpacing = [ 1, { when: 'always', spacing: { objectLiterals: 'never' }}];

exports.jsxHandlernames = [ 1, { checkLocalVariables: true, checkInlineFunction: false }];

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
