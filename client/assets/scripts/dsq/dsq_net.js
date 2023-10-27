// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let Game_net = require('../games/Game_net');

class Dsq_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['turn'] = this.turn;             /** 轮转 */
        cc.connect.eventlist['fanpai'] = this.fanpai;         /** 翻牌 */
        cc.connect.eventlist['movesuc'] = this.movesuc;       /** 移动 */
        cc.connect.eventlist['gameResult'] = this.gameResult; /** 游戏结果 */
        cc.connect.eventlist['zhuiqi'] = this.zhuiqi;         /** 追棋 */
        cc.connect.eventlist['whoWin'] = this.whoWin;         /** 谁赢了 */
    };

    /**
     * 追棋
     */
    zhuiqi(data){
        this.cclog("追棋 data = ", data);
        this._model.zhuiqi(data);
    }


    /**
     * 轮转
     * @param data
     */
    turn(data) {
        this.cclog("轮转 turn = ", data);
        this._model.turn(data);
    }

    /**
     * 翻牌成功
     * @param data
     */
    fanpai(data) {
        this.cclog("翻牌成功 fanpai = ", data);
        this._model.fanpai(data);
    }

    /**
     * 移动
     */
    movesuc(data) {
        this.cclog("移动 movesuc = ", data);
        this._model.movesuc(data);
    }

    /**
     * 游戏结果
     */
    gameResult(data) {
        this.cclog("游戏结果 游戏结果 = ", data);
        this._model.gameResult(data);

    }

    /**
     * 谁赢了
     * @param {*} data 
     */
    whoWin(data) {
        this.cclog("谁赢了 谁赢了 = ", data);
        //this._model.gameResult(data);
    }
}

module.exports = Dsq_net;
