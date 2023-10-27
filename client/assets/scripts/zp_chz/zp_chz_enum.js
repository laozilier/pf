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
        BANDIAN: 1,     //搬点状态
        PIAOFEN: 2,     //飘分状态
        SENDHOLDS: 3,   //发牌状态
        DRAWCARDWAIT: 4,//摸牌等待
        DISCARD: 5,     //出牌状态
        DISCARDWAIT: 6, //出牌等待
        DRAWCARD: 7,    //摸牌状态
        SETTLE: 8,      //结算状态
    },

    /** 客户端操作权限type **/
    actionType: {
        chi: 1,
        peng: 2,
        hu: 3,
        wangdiao: 4,
        wangchuang: 5,
        wangzha: 6,
    },

    /** 成牌类型 */
    inPokerType: {
        chi: 1,
        peng: 2,
        jiao: 3,    //
        xiao: 4,    //
        qing: 5,    //
        dui: 6,
        kan: 7,
        long: 8,
        zha: 9,
        chuang: 10,
        diao: 11,
    },

    /** 名堂 **/
    mingtangType: {
        pinghu: 1,
        honghu: 2,
        yidianzhu: 3,
        heihu: 4
    },

    /** 胡法 **/
    huType: {
        dianpao: 1,
        zimo: 2,
        wangdiao: 3,
        wangdiaowang: 4,
        wangchuang: 5,
        wangchuangwang: 6,
        wangzha: 7,
        wangzhawang: 8
    },



};

