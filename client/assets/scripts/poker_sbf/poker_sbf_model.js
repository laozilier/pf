// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Poker_sbf_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);
    }

    /***
     *  抓牌
     * @param data
     */
    holdArrays (data) {
        this._scene.holdArrays(data);
    }

    /**
     * * 庄家
     *  @param data
     * */
    broadcastBanker(data) {
        this._scene.broadcastBanker(data);
    }

    /***
     *  切牌
     * @param data
     */
    qieCard (data){
        this._scene.qieCard(data);
    }

    /***
     *  切牌
     * @param data
     */
    askcutCard(data) {
        this._scene.askcutCard(data);
    }

    /***
     *  轮转
     * @param data
     */
    turn (data){
        this._scene.turn(data);
    }

    /***
     *  出牌
     * @param data
     */
    discard (data) {
        this._scene.discard(data);
    }

    /***
     *  错误提示
     * @param data
     */
    error (data) {
        this._scene.error(data);
    }

    /**
     * 上一轮牌
     * @param data
     * */
    lastDiscards(data) {
        this._scene.lastDiscards(data);
    }

    /**
     * 闲家捡分
     * @param data
     * */
    getScore(data) {
        this._scene.getScore(data);
    }

    /**
     * 询问反主
     * @param data
     * */
    askfanzhu(data) {
        this._scene.askfanzhu(data);
    }

    /**
     * * 询问叫主
     *  @param data
     * */
    askjiaozhu(data) {
        this._scene.askjiaozhu(data);
    }

    /**
     * * 叫主
     *  @param data
     * */
    jiaozhu(data) {
        this._scene.jiaozhu(data);
    }

    /**
     * * 反主
     *  @param data
     * */
    fanzhu(data) {
        this._scene.fanzhu(data);
    }

    /**
     * * 放弃反主
     *  @param data
     * */
    giveup(data) {
        this._scene.giveup(data);
    }
}

module.exports = Poker_sbf_model;
