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
        A: 1,           //單張
        AA: 2,          //對子
        AABB: 3,        //拖拉机
        SHUAIZHU: 4,    //甩主
    },

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

    settleType: {
        NONE: 0,        //没有
    },

};

