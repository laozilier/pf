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

class Poker_sdh_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['holds'] = this.holdArrays;          /** 游戏手牌 */
        cc.connect.eventlist['turn'] = this.turn;                 /** 轮转 */
        cc.connect.eventlist['discard'] = this.discard;           /** 出牌*/
        cc.connect.eventlist['cutCard'] = this.qieCard;           /** 切牌 */
        cc.connect.eventlist['broadcastBanker'] = this.broadcastBanker;   /** 庄家*/
        cc.connect.eventlist['ask_cutCard'] = this.askcutCard;            /**询问切牌 */
        cc.connect.eventlist['dingzhu'] = this.dingzhu;                   /**定主 */
        cc.connect.eventlist['addBottmCards'] = this.addBottmCards;       /**拿底牌 */
        cc.connect.eventlist['maidi'] = this.maidi;                       /**埋底 */
        cc.connect.eventlist['xianScore'] = this.xianScore;               /**闲家捡分 */
        cc.connect.eventlist['lastDiscards'] = this.lastDiscards;         /**上一轮牌 */
        cc.connect.eventlist['liangdi'] = this.liangdi;                   /**游戏结束  亮底 */
        cc.connect.eventlist['ask_jiaofen'] = this.askjiaofen;            /**询问叫分 */
        cc.connect.eventlist['jiaofen'] = this.jiaofen;                   /**叫分 */
        cc.connect.eventlist['baofu'] = this.baofu;                       /**报副 */
        cc.connect.eventlist['liushou'] = this.liushou;                   /**留守 */
        cc.connect.eventlist['surrender'] = this.surrender;               /**投降 */
        cc.connect.eventlist['replySurrender'] = this.replySurrender;     /**是否同意投降 */

        this.initEvents();
    };

    /**
     * 是否同意投降
     * @param data
     * */
    replySurrender(data) {
        this.cclog("是否同意投降  replySurrender:",data);
        this._model.replySurrender(data);
    }

    /**
     * 投降
     * @param data
     * */
    surrender(data) {
        this.cclog("投降  surrender:",data);
        this._model.surrender(data);
    }

    /**
     * 留守
     * @param data
     * */
    liushou(data) {
        this.cclog("留守  liushou:",data);
        this._model.liushou(data);
    }

    /**
     * 报副
     * @param data
     * */
    baofu(data) {
        this.cclog("报副  baofu:",data);
        this._model.baofu(data);
    }

    /**
     * 叫分
     * @param data
     * */
    jiaofen(data) {
        this.cclog("叫分  jiaofen:",data);
        this._model.jiaofen(data);
    }

    /**
     * 询问叫分
     * @param data
     * */
    askjiaofen(data) {
        this.cclog("询问叫分  askjiaofen:",data);
        this._model.askjiaofen(data);
    }

    /**
     * 游戏结束
     * @param data
     * */
    liangdi(data) {
        this.cclog("游戏结束 亮底 liangdi:",data);
        this._model.liangdi(data);
    }

    /**
     * 上一轮牌
     * @param data
     * */
    lastDiscards(data) {
        this.cclog("上一轮牌 lastDiscards:",data);
        this._model.lastDiscards(data);
    }

    /**
     * 闲家捡分
     * @param data
     * */
    xianScore(data) {
        this.cclog("闲家捡分 xianScore:",data);
        this._model.xianScore(data);
    }

    /**
     * 埋底
     * @param data
     * */
    maidi(data) {
        this.cclog("埋底 maidi:",data);
        this._model.maidi(data);
    }

    /**
     * 拿底牌
     * @param data
     * */
    addBottmCards(data) {
        this.cclog("拿底牌 addBottmCards:",data);
        this._model.addBottmCards(data);
    }

    /**
     * 定主
     * @param data
     * */
    dingzhu(data) {
        this.cclog("定主 dingzhu:",data);
        this._model.dingzhu(data);
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
     * * 庄家
     *  @param data
     * */
    broadcastBanker(data) {
        this.cclog("庄家 broadcastBanker:",data);
        this._model.broadcastBanker(data);
    }

    /***
     *  切牌
     * @param data
     */
    qieCard (data){
        this.cclog("切牌 qieCard = ",data);
        this._model.qieCard(data);
    }

    /**
     * * 游戏结束
     *  @param data
     * */
    gameResult(data) {
        this.cclog("游戏结束 gameResult:",data);
        this._model.gameResult(data);
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
}

module.exports = Poker_sdh_net;
