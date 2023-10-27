/**
 * Created by sam on 2020/5/21.
 * 游戏规则对象
 */


class DDZRule {
    constructor(rule) {
        rule = rule || {};
        this.ante = rule.ante || 100;                       //底分
        this.robMode = rule.robMode || 0;                   //0:抢地主 1:抢分
        this.isBrightCard = rule.isBrightCard || false;     //是否明牌

    }
}


module.exports = DDZRule;