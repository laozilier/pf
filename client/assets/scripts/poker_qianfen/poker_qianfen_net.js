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

class Poker_qianfen_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['broadcastBanker'] = this.broadcastBanker;         /** 庄家*/
        cc.connect.eventlist['ask_cutCard'] = this.askcutCard;    /** 询问切牌 */
        cc.connect.eventlist['holds'] = this.holdArrays;          /** 游戏手牌 */
        cc.connect.eventlist['turn'] = this.turn;                 /** 轮转 */
        cc.connect.eventlist['discard'] = this.discard;           /** 出牌*/
        cc.connect.eventlist['cutCard'] = this.cutCard;           /** 切牌 */
        cc.connect.eventlist['rank'] = this.rank;                 /**上中下游通知 */
        cc.connect.eventlist['pass'] = this.pass;                     /** 不要*/
        cc.connect.eventlist['asyncScore'] = this.asyncScore;         /** 分数同步*/
        cc.connect.eventlist['roundResult'] = this.roundResult;       /** 小结算*/
        cc.connect.eventlist['bottomCards'] = this.bottomCards;       /** 展示底牌*/
        this.initEvents();
    };

    /**
     * * 分数同步
     *  @param data
     * */
    asyncScore(data) {
        this.cclog("分数同步 asyncScore:",data);
        this._model.asyncScore(data);
    }

    /**
     * * 庄家
     *  @param data
     * */
    broadcastBanker(data) {
        this.cclog("庄家 broadcastBanker:",data);
        this._model.broadcastBanker(data);
    }

    /**
     * * 询问切牌
     *  @param data
     * */
    askcutCard(data) {
        this.cclog("询问切牌 askcutCard:",data);
        this._model.askcutCard(data);
    }

    /**
     * * 小结算
     *  @param data
     * */
    roundResult(data) {
        this.cclog("小结算 roundResult:",data);
        this._model.roundResult(data);
    }

    /***
     *  排名
     * @param data
     */
    rank (data){
        this.cclog("排名 rank = ",data);
        this._model.rank(data);
    }

    /***
     *  切牌
     * @param data
     */
    cutCard (data){
        this.cclog("切牌 cutCard = ",data);
        this._model.cutCard(data);
    }

    /***
     *  抓牌
     * @param data
     */
    holdArrays  (data) {
        this.cclog("抓牌 holdArrays:",data);
        this._model.holdArrays(data);
    }

    /***
     *  轮转
     * @param data
     */
    turn (data){
        this.cclog('轮转  turn:',data);
        this._model.turn(data);
    }

    /**
     * 出牌
     * @param data
     */
    discard (data){
        this.cclog("出牌net discard:",data);
        this._model.discard(data);
    }

    /***
     *  不要
     * @param data
     */
    pass (data) {
        this.cclog("不要 pass:",data);
        this._model.pass(data);
    }

    /***
     *  展示底牌
     * @param data
     */
    bottomCards(data) {
        this.cclog("展示底牌 bottomCards:",data);
        this._model.bottomCards(data);
    }
}

module.exports = Poker_qianfen_net;
