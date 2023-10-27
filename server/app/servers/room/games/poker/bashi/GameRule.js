/**
 * Created by sam on 2020/5/21.
 * 游戏规则对象
 */


class BashiRule {
    constructor(rule) {
        rule = rule || {};
        this.ante = rule.ante || 100;           //底分
        this.needRed2 = rule.needRed2 || 0;     //带红2叫主 0表示不需要
        this.fanCount = rule.fanCount || 0;     //反主次数  0表示无限
        this.isNotHas6 = rule.isNotHas6 || 0;   //1=牌里面没6
        this.xiaofan = rule.fanLimit ? 130 : 125;   //小反
        this.dafan = rule.fanLimit ? 160 : 155;     //大反
        this.xiaoguang = 30;    //小光
        this.daguang = 0;       //大光
        this.kuascore = 80;
        this.fanzhuMul = rule.fanzhuMul || 0;   //0=反主+1 1=反主*2
        this.shuaiPai = rule.shuaiPai || 0;     //0=不可以甩牌
    }
}


module.exports = BashiRule;