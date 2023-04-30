exports.noUnderscoreDangle = [ 2, { allow: [ '__typename', '__REDUX_DEVTOOLS_EXTENSION_COMPOSE__' ] }];

exports.noUnusedExpressions = [
    1,
    {
        // ? allow all to loose the rule strictness
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
