/**
 * Created by sam on 2020/5/21.
 * 游戏规则对象
 */


class SbfRule {
    constructor(rule) {
        rule = rule || {};
        this.ante = rule.ante || 1000;           //底分
    }
}


module.exports = SbfRule;