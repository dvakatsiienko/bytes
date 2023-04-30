exports.noRestrictedSyntax = [
    // ? airbnb-config-base override — drop «for of» restriction
    2,
    {
        selector: 'ForInStatement',
        message:
            'for..in loops iterate over the entire prototype chain, which is virtually never what you want. Use Object.{keys,values,entries}, and iterate over the resulting array.',
    },
    {
        selector: 'LabeledStatement',
        message:
            'Labels are a form of GOTO; using them makes code confusing and hard to maintain and understand.',
    },
    {
        selector: 'WithStatement',
        message:
            '`with` is disallowed in strict mode because it makes code impossible to predict and optimize.',
    },
];

exports.noUnderscoreDangle = [ 2, { allow: [ '__typename', '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' ] }];

exports.noUnusedExpressions = [
    // ? airbnb-config-base override — allow all to loose the rule strictness
    2,
    {
        allowShortCircuit:    true,
        allowTernary:         true,
        allowTaggedTemplates: true,
        enforceForJSX:        true,
    },
];

exports.maxLen = [
    // ? airbnb-config-base override — ignoreComments: true
    2,
    {
        tabWidth:               4,
        code:                   100,
        ignoreComments:         true,
        ignoreUrls:             true,
        ignoreStrings:          true,
        ignoreTemplateLiterals: true,
    },
];
