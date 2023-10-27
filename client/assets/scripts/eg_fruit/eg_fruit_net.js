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

class Eg_fruit_net extends Game_net {
    constructor(model) {
        super(model);
        cc.connect.eventlist['poolScore'] = this.poolScore;       /**奖池 */
        cc.connect.eventlist['bet'] = this.bet;                   /**玩家下注 */
        cc.connect.eventlist['reward'] = this.reward;             /**游戏中将结果 */

        this.initEvents();
    };

    /**
     * 奖池
     * @param data
     */
     poolScore (data){
        this.cclog("奖池 poolScore:",data);
        this._model.poolScore(data);
    }

    /**
     * 玩家下注
     * @param data
     */
    bet (data){
        this.cclog("玩家下注 bet:",data);
        this._model.bet(data);
    }

    /***
     *  游戏中将结果
     * @param data
     */
    reward (data) {
        this.cclog("游戏中将结果 reward:",data);
        this._model.reward(data);
    }
}

module.exports = Eg_fruit_net;
