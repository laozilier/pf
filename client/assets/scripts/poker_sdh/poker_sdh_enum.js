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
    cardsType: {
        NONE: 0,        //没有
        A: 1,           //单张
        AA: 2,          //对子
        AABB: 3,        //拖拉机
        SHUAIZHU: 4,    //甩牌
    },

    status: {
        BEGIN: 0,       //游戏开始
        CUT_CARD: 1,    //切牌状态
        SENDHOLDS: 2,   //发牌状态
        JIAOFEN: 3,     //叫分状态
        DINGZHU: 4,     //定主
        MAIDI: 5,       //埋底
        DISCARD: 6,     //出牌状态
        SETTLE: 7,      //结算状态
        LIUJU: 8,       //流局状态
        WAIT: 9,        //等待状态
        SURRENDER: 10,  //投降状态
        LIUSHOU: 11,    //留守状态
    },

    settleType: {
        NONE: 0,        //没有
        DAGUANG: 1,     //大光
        XIAOGUANG: 2,   //小光
        GUO: 3,         //过庄
        KUA: 4,         //跨庄
        XIAODAO: 5,     //小倒
        DADAO: 6,       //大倒
    },
};

