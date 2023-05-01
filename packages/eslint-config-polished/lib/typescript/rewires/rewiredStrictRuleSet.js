/* Core */
const strictRuleSet = require('@typescript-eslint/eslint-plugin').configs.strict;

/* Instruments */
const { rewireRuleSet } = require('./rewireRuleSet');

const rewiredStrictRuleSet = rewireRuleSet(strictRuleSet);

module.exports = rewiredStrictRuleSet;
