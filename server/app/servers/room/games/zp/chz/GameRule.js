/**
 * Created by sam on 2020/5/21.
 * 游戏规则对象
 */


class ChzRule {
    constructor(rule) {
        rule = rule || {};
        this.ante = rule.ante || 100;           //底分
        this.wangNum = rule.wangNum || 0;       //几个王
        this.fanxing = rule.fanxing || 0;       //0=下醒 1=本醒 2=上醒 3=跟醒
        this.gameRules = rule.gameRules || [];  //0 二滚一(坐醒) 1 红黑
        this.piaofen = rule.piaofen || 0;       //飘分 0 10 20 30 倍底注
    }
}

module.exports = ChzRule;