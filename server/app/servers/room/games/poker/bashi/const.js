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
        SETTLE: 6,      //结算状态
        LIUJU: 7,       //流局状态
        MAIDI: 8,       //埋底
        DINGZHU: 9,     //定主
        FRIEND: 10,     //选队友,
        WAIT: 11,
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
        DAGUANG: 1,     //大光
        XIAOGUANG: 2,   //小光
        GUO: 3,         //过庄
        KUA: 4,         //跨庄
        XIAOFAN: 5,     //小反
        DAFAN: 6,       //大反
    },
};

