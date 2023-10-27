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

class Pdk_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['broadcastBanker'] = this.broadcastBanker;    /** 庄家 */
        cc.connect.eventlist['ask_cutCard'] = this.askcutCard;    /** 询问切牌 */
        cc.connect.eventlist['holds'] = this.holdArrays;          /** 游戏手牌 */
        cc.connect.eventlist['turn'] = this.turn;                 /** 轮转 */
        cc.connect.eventlist['discard'] = this.discard;           /** 出牌 */
        cc.connect.eventlist['gameTips'] = this.gameTips;         /** 游戏提示 */
        cc.connect.eventlist['pass'] = this.pass;                 /** 不要 */
        cc.connect.eventlist['alert'] = this.alert;               /** 警报 */

        cc.connect.eventlist['bomb_score'] = this.bomb_score;     /** 炸弹分 */
        cc.connect.eventlist['localCardNum'] = this.localCardNum; /** 当前牌数 */
        cc.connect.eventlist['loserCard'] = this.loserCard;       /** 当局结束时，剩余手牌 */
        cc.connect.eventlist['cutCard'] = this.cutCard;           /** 切牌 */
        cc.connect.eventlist['heitao3'] = this.heitao3;           /** 黑桃3 */

        this.initEvents();
    };

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

    /***
     *  抓牌
     * @param data
     */
    holdArrays  (data) {
        this.cclog(" 抓牌！！！ holdArrays = ",data);
        this._model.holdArrays(data);
    }

    /***
     *  轮转
     * @param data
     */
    turn (data){
        this.cclog("轮转 turn = ",data);
        this._model.turn(data);
    }

    /**
     * 出牌
     * @param data
     */
    discard (data){
        this.cclog("收到出牌 discard = ",data);
        this._model.discard(data);
    }

    /**
     * 不要
     * @param data
     */
    pass (data) {
        this.cclog("收到不要消息 pass = ",data);
        this._model.pass(data);
    }

    /**
     * 警报
     * @param data
     */
    alert (data){
        this.cclog("警报 alert = ",data);
        this._model.alert(data);
    }

    /**
     * 炸弹分
     * @param data
     */
    bomb_score (data){
        this.cclog("炸弹分消息 bomb_score = ",data);
        this._model.bomb_score(data);
    }

    /***
     *  当局牌数
     * @param data
     */
    localCardNum (data){
        this.cclog("当局牌数 localCardNum = ",data);
        this._model.localCardNum(data);
    }

    /***
     *  剩余手牌
     * @param data
     */
    loserCard (data){
        this.cclog("剩余手牌 loserCard = ",data);
        this._model.loserCard(data);
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
     *  黑桃三动画
     * @param data
     */
    heitao3 (data){
        this.cclog("黑桃三动画 heitao3 = ",data);
        this._model.heitao3(data);
    }
}

module.exports = Pdk_net;
