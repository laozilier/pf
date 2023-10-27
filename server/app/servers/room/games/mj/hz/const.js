/**
 * Created by sam on 2020/5/19.
 *
 */

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
};

