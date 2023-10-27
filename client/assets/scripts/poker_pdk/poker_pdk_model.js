// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Pdk_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);

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
    askcutCard(data) {
        this._scene.askcutCard(data);
    }
    
    /***
     *  抓牌
     * @param data
     */
    holdArrays (data) {
        this._scene.holdArrays(data);
    }

    /**
     * 轮到谁出牌
     * @param data
     */
    turn(data) {
        this._scene.turn(data);
    };

    /**
     * 出牌
     * @param data
     */
    discard(data) {
        this._scene.discard(data);
    }

    /**
     * 不要
     * @param data
     */
    pass(data){
        this._scene.pass(data);
    }

    /**
     * 警报
     * @param data
     */
    alert(data){
        this._scene.alert(data);
    }

    /**
     * 炸弹分
     * @param data
     */
    bomb_score(data) {
        this._scene.bomb_score(data);
    }

    /***
     *  当局牌数
     * @param data
     */
    localCardNum(data){
        this._scene.localCardNum(data);
    }

    /***
     *  剩余手牌
     * @param data
     */
    loserCard(data){
        this._scene.loserCard(data);
    }

    /***
     *  切牌
     * @param data
     */
    cutCard(data){
        this._scene.cutCard(data);
    }

    /***
     *  黑桃三动画
     * @param data
     */
    heitao3 (data){
        this._scene.heitao3(data);
    }
}

module.exports = Pdk_model;
