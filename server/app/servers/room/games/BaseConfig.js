/**
 *  创建者： THB
 *  日期：2018/6/29 16:20
 */

/**
 * @namespace gameConfig
 */
class BaseConfig {
    constructor(){
        this.playerMax = [6];      //房间最大玩家数量
        this.innings = [10, 20]; //局数列表
        /** 自动开始下一局的时间间隔 */
        this.autoNextTime = 25;
    }


    /**
     * 获取房间局数
     * @returns {number}  房间局数
     */
    getInning (data){
        let inn = this.innings[data.inning];
        return inn || this.innings[0];
    }

    /**
     * 底注
     * @param rule
     * @returns {number|*}
     */
    getAnte(rule){
        return rule.ante || 0;
    }

    /**
     * 游戏税收
     * @param rule  游戏规则
     * @returns {number}
     */
    getTax(rule) {
        return Math.ceil(this.getAnte(rule) * 0.3);
    }

    /**
     * 入场分数
     * @param rule
     */
    entryScore(rule){
        return 0;
    }

    /**
     * 离场分数
     * @param rule
     */
    leaveScore(rule){
        return 0;
    }

    /**
     * 最大离场分数
     * @param rule  规则
     * @returns {number}
     */
    maxLeaveScore(rule) {
        return 999999999999;
    }
}

module.exports = BaseConfig;