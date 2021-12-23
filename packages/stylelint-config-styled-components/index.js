module.exports = {
    processors: ['stylelint-processor-styled-components'],
    extends: [
        'stylelint-config-styled-components',
        'stylelint-config-standard',
        'stylelint-config-recess-order',
    ],
    plugins: [
        'stylelint-order',
        'stylelint-selector-no-empty',
        'stylelint-declaration-block-no-ignored-properties',
        'stylelint-use-nesting',
    ],
    rules: {
        'order/order': ['custom-properties', 'declarations'],
        'plugin/stylelint-selector-no-empty': true,
        'plugin/declaration-block-no-ignored-properties': true,
        'csstools/use-nesting': 'always',

        indentation: 4,
        'declaration-colon-newline-after': null,
        'value-keyword-case': ['lower', { ignoreKeywords: ['dummyValue'] }],
        'no-empty-source': null,
    },
};
