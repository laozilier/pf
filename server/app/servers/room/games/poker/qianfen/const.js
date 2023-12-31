/**
 * Created by sam on 2020/5/19.
 *
 */

module.exports = {
    cardsType: {
        NONE: 0,    //没有
        A: 1,       //單張
        AA: 2,      //對子
        AAABB: 3,   //三帶
        AABB: 4,    //連對
        ABC: 5,     //順子
        AAAA: 6,    //炸彈
        AAABBB: 7,  //飛機
    },

    status: {
        BEGIN: 0,       //游戏开始
        CUT_CARD: 1,    //切牌状态
        DISCARD: 2,     //出牌状态
        SETTLE: 3,      //结算状态
    },

    //炸弹奖励分(加法叠加)
    bombReward:
        [{
            7: 50,
            8: 100,
            9: 200,
            10: 400,
            11: 500,
            12: 700,
        }, {
            7: 100,
            8: 200,
            9: 400,
            10: 800,
            11: 1600,
            12: 3200,
        }],

    //排名分（2人）
    rankScore_2: [[60, -60], [40, -40]],
    //排名分（3人）
    rankScore_3: [[100, -40, -60], [100, -30, -70], [100, 0, -100]],
};

