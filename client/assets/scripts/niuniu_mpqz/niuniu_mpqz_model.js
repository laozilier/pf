// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class niuniu_mpqz_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);
    }

    /**
     * 随机抢庄
     * @param {*} data 
     */
    randomDeclarering (data) {
        this._scene.randomDeclarering(data);
    }

    /**
     * 随机庄家
     * @param {*} data 
     */
    randomDeclarer (data) {
        this._decl = data.decl;
        this._scene.randomDeclarer(data);
    }

    /**
     * 是否能推注
     * @param {*} data 
     */
    canTuizhu (data) {
        this._scene.canTuizhu(data);
    }

    /**
     * 发牌
     * @param {*} data 
     */
    deal (data) {
        this._scene.deal(data);
    }

    /**
     * 开始下注
     * @param {*} data 
     */
    startBet (data) {
        this._scene.startBet(data);
    }

    /**
     * 玩家下注
     * @param {*} data 
     */
    bet (data) {
        this._scene.bet(data);
    }
    
    /**
     * 亮牌
     * @param {*} data 
     */
    showHolds (data) {
        this._scene.showHolds(data);
    }

    /**
     * 发4张牌
     * @param {*} data 
     */
    holds4 (data) {
        this._holds = data;
        this._scene.holds4(data);
    }

    /**
     * 发1张牌
     * @param {*} data 
     */
    holds1 (data) {
        this._lastCardValue = data.v;
        this._scene.holds1(data);
    }

    /**
     * 抢庄
     * @param {*} data 
     */
    rob (data) {
        this._scene.rob(data);
    }

    /**
     * 开始抢庄
     * @param {*} data 
     */
    pleaseRob (data) {
        this._scene.pleaseRob(data);
    }

    /**
     * 开始搓牌
     * @param {*} data 
     */
    startCuoPai (data) {
        this._scene.startCuoPai(data);
    }

    /**
     * 发送赖子牌
     * @param {*} data 
     */
    getLaiziPoker(data) {
        this._scene.getLaiziPoker(data);
    }
}

module.exports = niuniu_mpqz_model;
