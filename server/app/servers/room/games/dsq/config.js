/**
 *  创建者： THB
 *  日期：2018/6/29 16:14
 *
 *
 *  游戏配置信息
 */

class DsqConfig extends require('../BaseConfig') {
    constructor() {
        super();
        this.autoNextTime = 30;
        this.playerMax = [2];
    }

    getTax(rule) {
        return 0;
    }

    /**
     * 获取底注分数
     * @param rule
     * @returns {number}
     */
    getAnte(rule) {
        return rule.ante;
    }

    /**
     * 入场分数
     * @param rule
     */
    entryScore(rule) {
        return 0;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule) {
        return 0;
    }

    /**
     * 最大离场分数
     * @param rule
     * @returns {number}
     */
    maxLeaveScore(rule) {
        return 99999999999999;
    }
}

module.exports = new DsqConfig();