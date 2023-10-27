module.exports = {
        status: {
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
            //游戏结束状态
            RESULT:6,
            /**随机庄家*/
            randomDeclarer: 7
    },
};