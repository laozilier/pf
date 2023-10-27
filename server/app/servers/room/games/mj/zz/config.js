/**
 *  创建者： THB
 *  日期：2018/6/29 16:14
 *
 *
 *  游戏配置信息
 */

class mahJConfig extends require('../../BaseConfig') {
    constructor() {
        super();
        this.playerMax = [2,3,4];      //房间最大玩家数量
        /** 自动开始下一局的时间间隔 */
        this.autoNextTime = 300;
    }

    /**
     * 入场分数
     * @param rule
     */
    entryScore(rule) {
        return rule.ante * 64;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule) {
        return rule.ante * 64 * 0.8;
    }

    getTax(rule) {
        return Math.ceil(this.getAnte(rule) * 0.2);
    }

    getBaseScore() {
        return this.baseScore;
    }

    /**
     * 获得麻将数据类型
     * @returns {number}
     */
    get_poker_tpye(){
        return 1;
    }

    //todo 是否开放托管
    if_open_trusteeship()
    {
        return true;
    }
}

module.exports = new mahJConfig();