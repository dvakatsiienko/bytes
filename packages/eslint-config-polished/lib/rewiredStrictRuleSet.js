/* Core */
const strictRuleSet = require('@typescript-eslint/eslint-plugin').configs.strict;

/* Instruments */
const { rewireRuleSeverityFromStringToNumber } = require('./rewireRuleSeverityFromStringToNumber');

const rewiredStrictRuleSet = rewireRuleSeverityFromStringToNumber(strictRuleSet);

module.exports = rewiredStrictRuleSet;
