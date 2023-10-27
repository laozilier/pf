/**
 * Created by sam on 2020/5/19.
 *
 */

module.exports = {
    status: {
        BEGIN: 0,       //游戏开始
        BANDIAN: 1,     //搬点状态
        PIAOFEN: 2,     //飘分状态
        SENDHOLDS: 3,   //发牌状态
        DRAWCARDWAIT: 4,//摸牌等待
        DISCARD: 5,     //出牌状态
        DISCARDWAIT: 6, //出牌等待
        DRAWCARD: 7,    //摸牌状态
        SETTLE: 8,      //结算状态
    },
};

