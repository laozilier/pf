/**
 *  创建者： THB
 *  日期：2019/12/31
 */

module.exports = {
    BEGIN: 0,
    /**等牌下注状态*/
    WAIT_BETS: 1,
    /**搓牌状态(五张牌)*/
    CUOPAI_FIVE: 2,
    /**等待抢庄,明牌模式*/
    WAIT_ROBS_OPEN: 3,
    /**等待抢庄，抢庄模式*/
    WAIT_ROBS: 4,
    /**搓牌状态(一张牌)*/
    CUOPAI_ONE: 5,
    /** 锅底牛 等待上庄 **/
    等待上庄: 6,

    //每个状态最长时间
    autoTimes: [0, 12, 15, 10, 10, 15, 10],

    //翻倍规则
    getDoublingRule: function (id) {
        let doubling = [
            [1, 1, 1, 1, 1, 1, 1, 2, 2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 10],         //正常牛
            [1, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 15, 16, 16, 17, 17, 18, 20], //牛番
        ];
        return (doubling[id] || doubling[0]);
    }
};