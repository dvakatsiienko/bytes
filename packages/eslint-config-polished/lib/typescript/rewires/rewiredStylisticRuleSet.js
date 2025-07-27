/**
 * ? This module is not used until @typescript-eslint v6 is released.
 */


const stylisticRuleSet = require('@typescript-eslint/eslint-plugin').configs.stylistic;


const { rewireRuleSet } = require('./rewireRuleSet');

const rewiredStylisticRuleSet = rewireRuleSet(stylisticRuleSet);

module.exports = rewiredStylisticRuleSet;
