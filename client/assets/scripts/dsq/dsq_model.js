// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Dsq_model extends require('../games/Game_model') {
    constructor(scene) {
        super(scene);

    }

    /**
     * 游戏信息，断线重连会收到
     * @param data
     */
    gameInfo(data) {
        super.gameInfo(data);
    };

    /***
     *  游戏开始
     * @param data
     */
    gameBegin(data) {
        this._uids = data.uids;
        super.gameBegin(data);
    }

    /**
     * 轮转
     * @param data
     */
    turn(data) {
        this._scene.turn(data);
    }

    /**
     * 翻牌成功
     * @param data
     */
    fanpai(data) {
        this._scene.fanpai(data);
    }

    /**
     * 移动
     */
    movesuc(data) {
        this._scene.movesuc(data);
    }

    /**
     * 游戏结果
     */
    gameResult(data) {
        this._scene.gameResult(data);
    }

    zhuiqi(data){
        this._scene.zhuiqi(data);
    }
}

module.exports = Dsq_model;

