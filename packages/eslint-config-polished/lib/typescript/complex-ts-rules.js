/* Instruments */
const { getJsRule } = require('./getJsRule');

exports.banTsComment = [
    // ! reduce severity, rewire options
    1,
    {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore':       'allow-with-description',
        'ts-nocheck':      true,
        'ts-check':        true,
    },
];

exports.banTsTypes = [
    2,
    {
        types: {
            'React.FC': 'React.FC type is deprecated, provide a type for props directly instead.',
            FC:         'React.FC type is deprecated, provide a type for props directly instead.',
            'React.FunctionComponent':
                'React.FunctionComponent type is deprecated, provide a type for props directly instead.',
            'React.VFC':                   'React.VFC type is deprecated, use React.FC instead.',
            VFC:                           'React.VFC type is deprecated, use React.FC instead.',
            'React.VoidFunctionComponent': 'React.VFC type is deprecated, use React.FC instead.',

            '{}': false,
        },
        extendDefaults: true,
    },
];

exports.memberOrdering = [
    1,
    {
        default: [
            // ? Signatures
            'signature',
            'call-signature',

            // ? Constructors
            'public-constructor',
            'protected-constructor',
            'private-constructor',
            'constructor',

            // ? Fields
            'public-static-field',
            'protected-static-field',
            'private-static-field',
            '#private-static-field',

            'public-decorated-field',
            'protected-decorated-field',
            'private-decorated-field',

            'public-instance-field',
            'protected-instance-field',
            'private-instance-field',
            '#private-instance-field',

            'public-abstract-field',
            'protected-abstract-field',

            'public-field',
            'protected-field',
            'private-field',
            '#private-field',

            'static-field',
            'instance-field',
            'abstract-field',

            'decorated-field',

            'field',

            // ? Static initialization
            'static-initialization',

            // ? Getters
            'public-static-get',
            'protected-static-get',
            'private-static-get',
            '#private-static-get',

            'public-decorated-get',
            'protected-decorated-get',
            'private-decorated-get',

            'public-instance-get',
            'protected-instance-get',
            'private-instance-get',
            '#private-instance-get',

            'public-abstract-get',
            'protected-abstract-get',

            'public-get',
            'protected-get',
            'private-get',
            '#private-get',

            'static-get',
            'instance-get',
            'abstract-get',

            'decorated-get',

            'get',

            // ? Setters
            'public-static-set',
            'protected-static-set',
            'private-static-set',
            '#private-static-set',

            'public-decorated-set',
            'protected-decorated-set',
            'private-decorated-set',

            'public-instance-set',
            'protected-instance-set',
            'private-instance-set',
            '#private-instance-set',

            'public-abstract-set',
            'protected-abstract-set',

            'public-set',
            'protected-set',
            'private-set',
            '#private-set',

            'static-set',
            'instance-set',
            'abstract-set',

            'decorated-set',

            'set',

            // ? Methods
            'public-static-method',
            'protected-static-method',
            'private-static-method',
            '#private-static-method',

            'public-decorated-method',
            'protected-decorated-method',
            'private-decorated-method',

            'public-instance-method',
            'protected-instance-method',
            'private-instance-method',
            '#private-instance-method',

            'public-abstract-method',
            'protected-abstract-method',

            'public-method',
            'protected-method',
            'private-method',
            '#private-method',

            'static-method',
            'instance-method',
            'abstract-method',

            'decorated-method',

            'method',
        ],
    },
];

exports.memberDelimiterStyle = [
    1,
    {
        multiline:          { delimiter: 'comma', requireLast: true },
        singleline:         { delimiter: 'comma', requireLast: false },
        multilineDetection: 'brackets',
    },
];

exports.paddingLineBetweenStatements = [
    // ? Deep-cloned via JSON.stringify/parse becase «@typescript-eslint»'s equivalent of the rule adds additional rule options: «interface» and «type» which is being injected into the object, and gets passed back to ESLint's javascript config, thus breaking it. Because it is a single object, and it is working with reference.
    ...JSON.parse(JSON.stringify(getJsRule('padding-line-between-statements'))),
    {
        blankLine: 'always',
        prev:      '*',
        next:      [ 'interface' ],
    },
];

exports.typeAnnotationSpacing = [
    1,
    {
        before:    false,
        after:     true,
        overrides: {
            arrow: {
                before: true,
                after:  true,
            },
        },
    },
];
