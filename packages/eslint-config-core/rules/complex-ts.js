/* Core */
const style = require('eslint-config-airbnb-base/rules/style');

exports.banTsComment = [
    2,
    {
        'ts-expect-error': 'allow-with-description',
        'ts-ignore':       'allow-with-description',
        'ts-nocheck':      'allow-with-description',
        'ts-check':        'allow-with-description',
    },
];

const [ , commaDangleRuleOpts ] = style.rules[ 'comma-dangle' ];

exports.commaDangleRuleOpts = commaDangleRuleOpts;
