/**
 *  创建者： T-Vick
 *  日期：2018/9/18 16:14
 *
 *
 *  游戏配置信息
 */

class Config extends require('../BaseConfig') {
    constructor() {
        super();
        this.autoNextTime = 6;
        this.playerMax = [4, 5, 6, 7];      //房间最大玩家数量
        this.maCardList = [0, 43, 48, 39];
        this.statusAutoTime = [0, 10, 15, 60, 0, 0];
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
        return this.getAnte(rule) * 100;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule) {
        return this.entryScore(rule) * 0.8;
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

module.exports = new Config();