/**
 * ? 1. Reduce the rule severity from «error» to 1 (warning).
 * ? 2. Delete «extends» property because in causes in error in main «typescript» config:
 * ?    - in base «ruleSet» that is being rewuired «extends» property points to relative «base» and «eslint-recommended» configs.
 * ?    - since new object with rules is created, those relative pointers are no longer valid.
 * ?    - thus, deleting them and pointing to them directly in main «typescript» config.
 */
function rewireRuleSet (ruleSet) {
    const nextRuleSet = { ...ruleSet };
    delete nextRuleSet.extends;

    for (const [ ruleKey, ruleValue ] of Object.entries(nextRuleSet.rules)) {
        if (ruleValue === 'off') nextRuleSet.rules[ ruleKey ] = 0;
        if (ruleValue === 'error') nextRuleSet.rules[ ruleKey ] = 1;
    }

    return nextRuleSet;
}
exports.rewireRuleSet = rewireRuleSet;
