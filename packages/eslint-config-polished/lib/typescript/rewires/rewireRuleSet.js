/**
 * ? 1. Reduce the rule severity from «error» to 1 (warning).
 * ? 2. Delete «extends» property because in causes in error in main «typescript» config:
 * ?    - in base «ruleSet» that is being rewuired «extends» property points to relative «base» and «eslint-recommended» configs.
 * ?    - since new object with rules is created, those relative pointers are no longer valid.
 * ?    - thus, deleting them and pointing to them directly in main «typescript» config.
 */
exports.rewireRuleSet = (ruleSet) => {
    const nextRuleSet = { ...ruleSet };
    delete nextRuleSet.extends;

    for (const [ ruleKey, ruleValue ] of Object.entries(nextRuleSet.rules)) {
        if (ruleValue === 'off' || typeRequiredRules.includes(ruleKey)) nextRuleSet.rules[ ruleKey ] = 0;
        if ([ 'warn', 'error' ].includes(ruleValue)) nextRuleSet.rules[ ruleKey ] = 1;
    }

    for (const [ ruleKey ] of Object.entries(nextRuleSet.rules)) {
        if (typeRequiredRules.includes(ruleKey)) nextRuleSet.rules[ ruleKey ] = 0;
    }

    return nextRuleSet;
};

/**
 * ? Rule set that requires type-checking of @typescript-eslint.
 *
 * ? The feature is overenginnered, so it's better to disable it.
 * ? In v6 there will be separate rule that includes all rules that requires type-checking.
 * ? When v6 is released, this may be removed by using that dedicated rule set.
 */
const typeRequiredRules = [
    '@typescript-eslint/no-base-to-string',
    '@typescript-eslint/no-meaningless-void-operator',
    '@typescript-eslint/dot-notation',
    '@typescript-eslint/await-thenable',
    '@typescript-eslint/consistent-type-exports',
    '@typescript-eslint/naming-convention',
    '@typescript-eslint/no-base-to-string',
    '@typescript-eslint/no-confusing-void-expression',
    '@typescript-eslint/no-duplicate-type-constituents',
    '@typescript-eslint/no-floating-promises',
    '@typescript-eslint/no-for-in-array',
    '@typescript-eslint/no-meaningless-void-operator',
    '@typescript-eslint/no-misused-promises',
    '@typescript-eslint/no-mixed-enums',
    '@typescript-eslint/no-redundant-type-constituents',
    '@typescript-eslint/no-unnecessary-boolean-literal-compare',
    '@typescript-eslint/no-unnecessary-condition',
    '@typescript-eslint/no-unnecessary-qualifier',
    '@typescript-eslint/no-unnecessary-type-arguments',
    '@typescript-eslint/no-unnecessary-type-assertion',
    '@typescript-eslint/no-unsafe-argument',
    '@typescript-eslint/no-unsafe-assignment',
    '@typescript-eslint/no-unsafe-call',
    '@typescript-eslint/no-unsafe-enum-comparison',
    '@typescript-eslint/no-unsafe-member-access',
    '@typescript-eslint/no-unsafe-return',
    '@typescript-eslint/non-nullable-type-assertion-style',
    '@typescript-eslint/prefer-includes',
    '@typescript-eslint/prefer-nullish-coalescing',
    '@typescript-eslint/prefer-readonly',
    '@typescript-eslint/prefer-readonly-parameter-types',
    '@typescript-eslint/prefer-reduce-type-parameter',
    '@typescript-eslint/prefer-regexp-exec',
    '@typescript-eslint/prefer-return-this-type',
    '@typescript-eslint/prefer-string-starts-ends-with',
    '@typescript-eslint/promise-function-async',
    '@typescript-eslint/require-array-sort-compare',
    '@typescript-eslint/restrict-plus-operands',
    '@typescript-eslint/restrict-template-expressions',
    '@typescript-eslint/strict-boolean-expressions',
    '@typescript-eslint/switch-exhaustiveness-check',
    '@typescript-eslint/unbound-method',
    '@typescript-eslint/no-implied-eval',
    '@typescript-eslint/no-throw-literal',
    '@typescript-eslint/require-await',
    '@typescript-eslint/return-await',
];
