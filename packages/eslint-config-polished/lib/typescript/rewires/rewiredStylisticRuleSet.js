/* Core */
const stylisticRuleSet = require('@typescript-eslint/eslint-plugin').configs.stylistic;

/* Instruments */
const { rewireRuleSet } = require('./rewireRuleSet');

const rewiredStylisticRuleSet = rewireRuleSet(stylisticRuleSet);

module.exports = rewiredStylisticRuleSet;
