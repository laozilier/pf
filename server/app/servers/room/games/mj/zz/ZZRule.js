/**
 * 游戏规则对象
 *  创建者： THB
 *  日期：2020/1/7
 */

class ZZRule {
    constructor(rule) {
        rule = rule || {};
        /**赖子数量*/
        this.rogue = rule.rogue || 0;
        /**一炮多响开关*/
        this.multiplayerHu = !!rule.multiplayerHu;
    }
}

module.exports = ZZRule;