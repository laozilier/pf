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
        BEGIN: 0,       //游戏开始
        SENDHOLDS: 1,   //发牌状态
        DISCARD: 2,     //出牌状态
        DRAWCARD: 3,    //摸牌状态
        DRAWCARDWAIT: 4,//摸牌后等待状态
        DISCARDWAIT: 5, //出牌后等待状态
        ACTIONWAIT: 6,  //操作后等待状态 可能碰了后还能继续杠  这种暂时不考虑
        SETTLE: 7,      //结算状态
    },

    /** 客户端操作权限type **/
    actionType: {
        pass: 0,
        chi: 1,
        peng: 2,
        gang: 3,
        bu: 4,
        hu: 5,
        wangdiao: 6,
        wangchuang: 7
    },

    /** 成牌类型 */
    inPokerType: {
        none: 0,
        chi: 1,
        peng: 2,
        gang: 3,
        bu: 4,
        dui: 5,
        kan: 6,
        diao: 7,
        chuang: 8,
    },

    /** 杠类型 */
    gangType: {
        dian: 0,
        an: 1,
        ming: 2,
    },

    /** 名堂 **/
    mingtangType: {
        none: 0,
        pinghu: 1,
    },

    /** 胡法 **/
    huType: {
        none: 0,
        dianpao: 1,
        zimo: 2,
        wangdiao: 3,
        wangdiaowang: 4,
        wangchuang: 5,
        wangchuangwang: 6,
    },
};