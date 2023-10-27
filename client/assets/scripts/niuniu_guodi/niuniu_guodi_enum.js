// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

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
        //等待上庄
        WAIT_ZHUANG:6,
        //等待收庄
        WAIT_SHOUZHUANG:7,
    },
};