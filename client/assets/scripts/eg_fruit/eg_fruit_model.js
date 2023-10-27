// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Eg_fruit_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);
    }

    /**
     * 奖池
     * @param data
     */
     poolScore (data){
        this._scene.poolScore(data);
    }

    /**
     * 玩家下注
     * @param data
     */
    bet (data){
        this._scene.bet(data);
    }

    /***
     *  游戏中将结果
     * @param data
     */
    reward (data) {
        this._scene.reward(data);
    }
}

module.exports = Eg_fruit_model;
