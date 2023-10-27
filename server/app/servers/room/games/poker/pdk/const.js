/**
 * Created by sam on 2020/5/19.
 *
 */

module.exports = {
    status: {
        BEGIN: 0,       //游戏开始
        CUT_CARD: 1,    //切牌状态
        SENDHOLDS: 2,   //发牌状态
        DISCARD: 3,     //出牌状态
        SETTLE: 4,      //结算状态
    },

    cardsType: {
        NONE: 0,    //没有
        A: 1,       //單張
        AA: 2,      //對子
        AAABB: 3,   //三帶
        AABB: 4,    //連對
        ABC: 5,     //順子
        AAAA: 6,    //炸彈
        AAABBB: 7,  //飛機
        AAAABB: 8,  //四带二
        AAAABBB: 9, //四带三
    },
};

