// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html


class Poker_qianfen_model extends require('../games/Game_model') {
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

    /***
     *  询问切牌
     * @param data
     */
    askcutCard (data) {
        this._scene.askcutCard(data);
    }

    /***
     *  排名
     * @param data
     */
    rank (data){
        this._scene.rank(data);
    }

    /***
     *  积分同步
     * @param data
     */
    asyncScore (data){
        this._scene.asyncScore(data);
    }

    /**
     * * 庄家
     *  @param data
     * */
    broadcastBanker(data) {
        this._scene.broadcastBanker(data);
    }

    /**
     * * 小结算
     *  @param data
     * */
    roundResult(data) {
        this._scene.roundResult(data);
    }

    /***
     *  切牌
     * @param data
     */
    cutCard(data){
        this._scene.cutCard(data);
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
        let uid = data.uid;
        if (uid == cc.dm.user.uid) {
            cc.gameargs.lastCard = null;
        } else {
            cc.gameargs.lastCard = data.cardsData;
        }
        this._scene.discard(data);
    }

    /***
     *  不要
     * @param data
     */
    pass (data) {
        this._scene.pass(data);
    }

    /***
     *  展示底牌
     * @param data
     */
    bottomCards(data) {
        this._scene.showBottomCards(data);
    }
}

module.exports = Poker_qianfen_model;
