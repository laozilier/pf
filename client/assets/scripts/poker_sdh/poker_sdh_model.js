// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Poker_sdh_model extends require('../games/Game_model') {
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

    /**
     * 游戏结束
     * @param data
     * */
    liangdi(data) {
        this._scene.liangdi(data);
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
    xianScore(data) {
        this._scene.xianScore(data);
    }

    /**
     * 埋底
     * @param data
     * */
    maidi(data) {
        this._scene.maidi(data);
    }

    /**
     * 拿底牌
     * @param data
     * */
    addBottmCards(data) {
        this._scene.addBottmCards(data);
    }

    /**
     * 定主
     * @param data
     * */
    dingzhu(data) {
        this._scene.dingzhu(data);
    }
    
    /**
     * 叫分
     * @param data
     * */
    jiaofen(data) {
        this._scene.jiaofen(data);
    }

    /**
     * 询问叫分
     * @param data
     * */
    askjiaofen(data) {
        this._scene.askjiaofen(data);
    }

    /**
     * 留守
     * @param data
     * */
    liushou(data) {
        this._scene.liushou(data);
    }

    /**
     * 报副
     * @param data
     * */
    baofu(data) {
        this._scene.baofu(data);
    }

    /**
     * 是否同意投降
     * @param data
     * */
    replySurrender(data) {
        this._scene.replySurrender(data);
    }

    /**
     * 投降
     * @param data
     * */
    surrender(data) {
        this._scene.surrender(data);
    }
}

module.exports = Poker_sdh_model;
