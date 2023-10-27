// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Zp_chz_model extends require('../games/Game_model') {
    constructor (scene) {
        super(scene);

    }

    /**
     * 流局
     * @param data
     * **/
    liuju(data) {
        this._scene.liuju(data);
    }

    /**
     * 翻醒
     * @param data
     * **/
    fanxing(data) {
        this._scene.fanxing(data);
    }

    /**
     * 桌面剩余牌数
     * @param data
     * **/
    bottomCards(data) {
        this._scene.bottomCards(data);
    }

    /**
     * 弃牌
     * @param data
     * **/
    qiPai(data) {
        this._scene.qiPai(data);
    }

    /**
     * 摸牌
     * @param data
     * **/
    drawCard(data) {
        this._scene.drawCard(data);
    }

    /**
     * * 吃 碰 进牌
     *  @param data
     * */
    inPoker(data) {
        this._scene.inPoker(data);
    }

    /**
     * * 庄家
     *  @param data
     * */
    broadcastBanker(data) {
        this._scene.broadcastBanker(data);
    }

    /**
     *
     * */
    bankLastcard(data) {
        this._scene.bankLastcard(data);
    }

    /**
     * 玩家操作
     * @param data
     * **/
    action(data) {
        this._scene.action(data);
    }


    /***
     *  抓牌
     * @param data
     */
    holdArrays (data) {
        this._scene.holdArrays(data);
    }

    /***
     *  错误信息
     * @param data
     */
    error (data) {
        this._scene.error(data);
    }

    /***
     *  询问飘分
     * @param data
     */
    askPiaofen (data){
        this._scene.askPiaofen(data);
    }

    /***
     *  飘分
     * @param data
     */
    piaofen (data){
        this._scene.piaofen(data);
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
     *  搬点
     * @param data
     */
    bandian (data) {
        this._scene.bandian(data);
    }

    /***
     *  出牌
     * @param data
     */
    discard (data) {
        this._scene.discard(data);
    }

    /**
     * 添加牌到手牌
     * @param {*} data 
     */
    addHolds (data){
        this._scene.addHolds(data);
    }

    /**
     * 玩家操作胡
     * @param {*} data 
     */
    actionHu (data){
        this._scene.actionHu(data);
    }

    /**
     * 玩家死手
     * @param {*} data 
     */
    sishou (data){
        this._scene.sishou(data);
    }

    /**
     * 隐藏玩家操作
     * @param {*} data 
     */
    hideAction (data){
        this._scene.hideAction(data);
    }

    /**
     * 出牌错误
     * @param {*} data 
     */
    discardErr (data){
        this._scene.discardErr(data);
    }
}

module.exports = Zp_chz_model;
