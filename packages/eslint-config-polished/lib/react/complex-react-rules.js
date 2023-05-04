exports.fnComponentDefinition = [
    1,
    { namedComponents: 'arrow-function', unnamedComponents: 'arrow-function' },
];

exports.jsxClosingBracketLocation = [ 1, { selfClosing: 'line-aligned', nonEmpty: 'after-props' }];

exports.jsxCurlySpacing = [ 1, { when: 'always', spacing: { objectLiterals: 'never' }}];

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

exports.jsxTagSpacing = [
    1,
    {
        closingSlash:      'never',
        beforeSelfClosing: 'always',
        afterOpening:      'never',
        beforeClosing:     'never',
    },
];

exports.jsxWrapMultilines = [
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
