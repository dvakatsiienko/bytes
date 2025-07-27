const recommendedRuleSet = require('@typescript-eslint/eslint-plugin').configs
  .recommended;

const { rewireRuleSet } = require('./rewireRuleSet');

const rewiredRecommendedRuleSet = rewireRuleSet(recommendedRuleSet);

module.exports = rewiredRecommendedRuleSet;
