/* Core */
const recommendedRuleSet = require('@typescript-eslint/eslint-plugin').configs.recommended;

/* Instruments */
const { rewireRuleSet } = require('./rewireRuleSet');

const rewiredRecommendedRuleSet = rewireRuleSet(recommendedRuleSet);

module.exports = rewiredRecommendedRuleSet;
