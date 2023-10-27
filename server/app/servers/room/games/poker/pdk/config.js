/**
 *  创建者： THB
 *  日期：2018/6/29 16:14
 *
 *
 *  游戏配置信息
 */

class PDKConfig extends require('../../BaseConfig') {
    constructor() {
        super();
        this.qiepaiTime = 6000;
        this.actionTime = 30000;
        this.autoNextTime = 8;
        this.playerMax = [2, 3];      //房间最大玩家数量
    }

    /**
     * 游戏税收
     * @param rule  游戏规则
     * @returns {number}
     */
    getTax(rule) {
        return Math.ceil(this.getAnte(rule) * 0.05);
    }

    /**
     * 获取底注分数
     * @param rule
     * @returns {number}
     */
    getAnte(rule){
        return rule.ante;
    }

    /**
     * 入场分数
     * @param rule
     */
    entryScore(rule) {
        return this.getAnte(rule) * 64;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule) {
        return this.entryScore(rule) * 0.2;
    }

    maxLeaveScore(rule){
        if (rule.ante == 10) {
            return 150000;
        }

        if (rule.ante == 100000) {
            return 999999999999;
        }

        return 999999999999;
        // return this.entryScore(rule) * 20;
    }
}

module.exports = new PDKConfig();