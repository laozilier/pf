/**
 * Created by sam on 2020/5/19.
 *
 */

module.exports = {
    cardsType: {
        NONE: 0,        //没有
        A: 1,           //单张
        AA: 2,          //对子
        ABC: 3,         //顺子
        AABB: 4,        //连对
        AAA: 5,         //三张
        AAAB: 6,        //三带一
        AAABB: 7,       //三带二
        AAABBB: 8,      //飞机
        AAAABB: 9,      //四带二
        AAAA: 10,       //炸弹
        BOMB: 11        //王炸
    },

    status: {
        BEGIN: 0,               //开始
        ROB_BANKER: 1,          //抢地主状态
        CALL_SCORE: 2,          //抢分
        DOUBLE_SCORE: 3,        //加倍状态
        DISCARD: 4,             //出牌中
        WAIT: 5,                //等待

    }
};

