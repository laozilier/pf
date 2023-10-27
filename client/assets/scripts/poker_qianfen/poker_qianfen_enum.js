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
        BEGIN: 0,               //开始
        CUT_CARD: 1,            //切牌状态
        DISCARD: 2,             //出牌中
        WAIT: 3,                //等待
        WAIT_SETTLE: 4          //等待结算
    },

};

