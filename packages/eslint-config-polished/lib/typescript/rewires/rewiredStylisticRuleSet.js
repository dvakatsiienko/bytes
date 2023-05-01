/* Core */
const stylisticRuleSet = require('@typescript-eslint/eslint-plugin').configs.stylistic;

/* Instruments */
const { rewireRuleSeverityFromStringToNumber } = require('./rewireRuleSeverityFromStringToNumber');

const rewiredStylisticRuleSet = rewireRuleSeverityFromStringToNumber(stylisticRuleSet);

module.exports = rewiredStylisticRuleSet;
