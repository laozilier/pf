/**
 * Created by sam on 2020/5/19.
 *
 */

module.exports = {
    status: {
        BEGIN: 0,       //游戏开始
        CUT_CARD: 1,    //切牌状态
        SENDHOLDS: 2,   //发牌状态
        WAITJIAOZHU: 3, //等待叫主状态
        WAITFANZHU: 4,  //等待反主状态
        DISCARD: 5,     //出牌状态
        WAIT: 6,        //等待状态
        SETTLE: 7,      //结算状态
        LIUJU: 8,       //流局状态
    },

    cardsType: {
        NONE: 0,        //没有
        A: 1,           //单张
        AA: 2,          //对子
        AABB: 3,        //拖拉机
        SHUAIZHU: 4,    //甩牌
    },

    settleType: {
        NONE: 0,        //没有
    },
};

