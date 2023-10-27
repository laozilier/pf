/**
 * Created by sam on 2020/5/21.
 * 游戏规则对象
 */


class HzRule {
    constructor(rule) {
        rule = rule || {};
        this.ante = rule.ante || 10000; //底分

        this.gameRules = [1]; //一炮多响
    }
}

module.exports = HzRule;