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
        cc.connect.eventlist['bandian'] = this.bandian;           /** 搬点 */
        cc.connect.eventlist['discard'] = this.discard;           /** 出牌*/
        cc.connect.eventlist['askPiaofen'] = this.askPiaofen;     /** 询问飘分*/
        cc.connect.eventlist['piaofen'] = this.piaofen;           /** 飘分 */
        cc.connect.eventlist['error'] = this.error;               /** 错误*/
        cc.connect.eventlist['broadcastBanker'] = this.broadcastBanker;   /** 广播庄家*/
        cc.connect.eventlist['bankLastcard'] = this.bankLastcard;         /** 庄家拿最后一张牌*/
        cc.connect.eventlist['action'] = this.action;                     /** 玩家操作*/
        cc.connect.eventlist['inPoker'] = this.inPoker;           /** 吃 碰 进牌*/
        cc.connect.eventlist['drawCard'] = this.drawCard;         /** 摸牌*/
        cc.connect.eventlist['qiPai'] = this.qiPai;               /** 弃牌*/
        cc.connect.eventlist['bottomCards'] = this.bottomCards;   /** 桌面剩余牌数*/
        cc.connect.eventlist['fanxing'] = this.fanxing;           /** 翻醒*/
        cc.connect.eventlist['liuju'] = this.liuju;               /** 流局*/
        cc.connect.eventlist['addHolds'] = this.addHolds;         /** 摸到赖子时加入手牌*/
        cc.connect.eventlist['actionHu'] = this.actionHu;         /** 胡牌操作 播放胡动画*/
        cc.connect.eventlist['sishou'] = this.sishou;             /** 玩家死手*/
        cc.connect.eventlist['hideAction'] = this.hideAction;     /** 隐藏玩家操作*/
        cc.connect.eventlist['discardErr'] = this.discardErr;     /** 出牌错误*/

        this.initEvents();
    };

    /**
     * 流局
     * @param data
     * **/
    liuju(data) {
        this.cclog("流局 liuju:",data);
        this._model.liuju(data);
    }

    /**
     * 翻醒
     * @param data
     * **/
    fanxing(data) {
        this.cclog("翻醒 fanxing:",data);
        this._model.fanxing(data);
    }

    /**
     * 桌面剩余牌数
     * @param data
     * **/
    bottomCards(data) {
        this.cclog("桌面剩余牌数 bottomCards:",data);
        this._model.bottomCards(data);
    }

    /**
     * 弃牌
     * @param data
     * **/
    qiPai(data) {
        this.cclog("弃牌 qiPai:",data);
        this._model.qiPai(data);
    }


    /**
     * 摸牌
     * @param data
     * **/
    drawCard(data) {
        this.cclog("摸牌 drawCard:",data);
        this._model.drawCard(data);
    }


    /**
     * 吃 碰 进牌
     * @param data
     * **/
    inPoker(data) {
        this.cclog("吃 碰 进牌 inPoker:",data);
        this._model.inPoker(data);
    }


    /**
     * 庄家拿最后一张牌
     * @param data
     * **/
    bankLastcard(data) {
        this.cclog("庄家拿最后一张牌 bankLastcard:",data);
        this._model.bankLastcard(data);
    }

    /**
     * 玩家操作
     * @param data
     * **/
    action(data) {
        this.cclog("玩家操作 action:",data);
        this._model.action(data);
    }


    /**
     * * 错误信息
    *  @param data
    * */
    error(data) {
        this.cclog("错误信息 error:",data);
        this._model.error(data);
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
     *  询问飘分
     * @param data
     */
    askPiaofen (data){
        this.cclog("询问飘分 askPiaofen = ",data);
        this._model.askPiaofen(data);
    }

    /***
     *  飘分
     * @param data
     */
    piaofen (data){
        this.cclog("飘分 piaofen = ",data);
        this._model.piaofen(data);
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
        this.cclog('轮转  turn:', data);
        this._model.turn(data);
    }

    /**
     * 搬点
     * @param data
     */
    bandian (data){
        this.cclog('搬点 bandian:', data);
        this._model.bandian(data);
    }

    /**
     * 出牌
     * @param data
     */
    discard (data){
        this.cclog('出牌 discard:', data);
        this._model.discard(data);
    }

    /**
     * 添加牌到手牌
     * @param {*} data 
     */
    addHolds (data){
        this.cclog('添加牌到手牌 addHolds:', data);
        this._model.addHolds(data);
    }

    /**
     * 玩家操作胡
     * @param {*} data 
     */
    actionHu (data){
        this.cclog('玩家操作胡 actionHu:', data);
        this._model.actionHu(data);
    }

    /**
     * 玩家死手
     * @param {*} data 
     */
    sishou (data){
        this.cclog('玩家死手 sishou:', data);
        this._model.sishou(data);
    }

    /**
     * 隐藏玩家操作
     * @param {*} data 
     */
    hideAction (data){
        this.cclog('隐藏玩家操作 hideAction:', data);
        this._model.hideAction(data);
    }

    /**
     * 出牌错误
     * @param {*} data 
     */
    discardErr (data){
        this.cclog('出牌错误 discardErr:', data);
        this._model.discardErr(data);
    }
}

module.exports = Poker_sdh_net;
