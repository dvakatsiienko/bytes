const jsRuleSet = require('../javascript');

/* Helpers */
function getJsRule (ruleName) {
    return jsRuleSet.rules[ ruleName ];
}
exports.getJsRule = getJsRule;
