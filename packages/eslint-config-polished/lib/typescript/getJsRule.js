const jsRuleSet = require('../javascript');

/* Helpers */
function getJsRule (ruleName) {
    return jsRuleSet.overrides[ 0 ].rules[ ruleName ];
}
exports.getJsRule = getJsRule;
