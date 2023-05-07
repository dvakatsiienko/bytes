exports.noUnderscoreDangle = [ 2, { allow: [ '__typename', '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' ]}];

exports.noUnusedExpressions = [
    1,
    {
        allowShortCircuit:    true,
        allowTernary:         true,
        allowTaggedTemplates: true,
        enforceForJSX:        true,
    },
];

exports.spacedComment = [
    1,
    'always',
    {
        line:  { markers: [ '/' ], exceptions: [ '-', '+', '*' ]},
        block: { markers: [ '!' ], exceptions: [ '-', '+', '*' ], balanced: true },
    },
];

exports.arrayBracketSpacing = [ 1, 'always', { objectsInArrays: false, arraysInArrays: false }];

exports.maxLen = [
    1,
    {
        code:                   100,
        ignoreComments:         true,
        ignoreUrls:             true,
        ignoreStrings:          true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals:   true,
    },
];

exports.objectCurlySpacing = [ 1, 'always', { objectsInObjects: false, arraysInObjects: false }];

exports.paddingLineBetweenStatements = [
    1,
    {
        blankLine: 'always',
        prev:      '*',
        next:      [ 'class', 'return', 'for', 'do', 'while', 'switch', 'default' ],
    },
];
