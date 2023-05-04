exports.fnComponentDefinition = [
    1,
    { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
];

exports.jsxCurlySpacing = [ 1, { when: 'always', spacing: { objectLiterals: 'never' }}];

exports.jsxHandlernames = [ 1, { checkLocalVariables: true, checkInlineFunction: false }];

exports.jsxIdent = [ 1, 4, { checkAttributes: true, indentLogicalExpressions: true }];

exports.jsxSortProps = [
    1,
    {
        callbacksLast:        true,
        shorthandFirst:       true,
        multiline:            'last',
        noSortAlphabetically: false,
        reservedFirst:        true,
    },
];

exports.tagSpacing = [
    1,
    {
        closingSlash:      'never',
        beforeSelfClosing: 'always',
        afterOpening:      'never',
        beforeClosing:     'never',
    },
];

exports.wrapMultilines = [
    1,
    {
        declaration: 'parens-new-line',
        assignment:  'parens-new-line',
        return:      'parens-new-line',
        arrow:       'parens-new-line',
        condition:   'parens-new-line',
        logical:     'parens-new-line',
        prop:        'parens-new-line',
    },
];
