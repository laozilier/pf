// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class mj_hz_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);

    }

    /**
     * 广播庄家
     * @param {*} data 
     */
    broadcastBanker (data) {
        this._scene.broadcastBanker(data);
    }

    /**
     * 剩余牌数目
     * @param {*} data 
     */
    bottomCards (data) {
        this._scene.bottomCards(data);
    }

    /**
     * 手牌
     * @param {*} data 
     */
    holds (data) {
        this._scene.holds(data);
    }

    /**
     * 庄家最后一张牌
     * @param {*} data 
     */
    bankLastcard (data) {
        this._scene.bankLastcard(data);
    }

    /**
     * 出牌
     * @param {*} data 
     */
    discard (data) {
        this._scene.discard(data);
    }

    /**
     * 进牌
     * @param {*} data 
     */
    inPoker (data) {
        this._scene.inPoker(data);
    }

    /**
     * 弃牌
     * @param {*} data 
     */
    qiPoker (data) {
        this._scene.qiPoker(data);
    }

    /**
     * 摸牌
     * @param {*} data 
     */
    drawCard (data) {
        this._scene.drawCard(data);
    }

    /**
     * 操作
     * @param {*} data 
     */
    action (data) {
        this._scene.action(data);
    }

    /**
     * 隐藏操作
     * @param {*} data 
     */
    hideAction (data) {
        this._scene.hideAction(data);
    }

    /**
     * 事件错误
     * @param {*} data 
     */
    eventErr (data) {
        this._scene.eventErr(data);
    }

    /**
     * 轮转
     * @param {*} data 
     */
    turn (data) {
        this._scene.turn(data);
    }

    /**
     * 其他人手牌
     * @param {*} data 
     */
    otherHolds (data) { 
        this._scene.otherHolds(data);
    }

    /**
     * 胡牌操作 播放胡动画
     * @param {*} data 
     */
    actionHu (data) { 
        this._scene.actionHu(data);
    }

    /**
     * 最后一张弃牌
     * @param {*} data 
     */
    lastQiPoker (data) { 
        this._scene.lastQiPoker(data);
    }

    /**
     * 杠喜钱
     * @param {*} data 
     */
    gangScore (data) { 
        this._scene.gangScore(data);
    }

    /**
     * 扎鸟
     * @param {*} data 
     */
     zhaniao (data) { 
        this._scene.zhaniao(data);
    }
}

module.exports = mj_hz_model;
