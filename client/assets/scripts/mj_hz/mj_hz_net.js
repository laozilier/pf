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

class mj_hz_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['broadcastBanker'] = this.broadcastBanker;   /** 广播庄家*/
        cc.connect.eventlist['bottomCards'] = this.bottomCards;   /** 剩余牌数目*/
        cc.connect.eventlist['holds'] = this.holds;       /** 游戏手牌 */
        cc.connect.eventlist['bankLastcard'] = this.bankLastcard; /** 剩余牌数目*/
        cc.connect.eventlist['discard'] = this.discard;   /** 出牌 */
        cc.connect.eventlist['inPoker'] = this.inPoker;   /** 进牌 */
        cc.connect.eventlist['qiPai'] = this.qiPoker;     /** 弃牌 */
        cc.connect.eventlist['drawCard'] = this.drawCard; /** 摸牌 */
        cc.connect.eventlist['action'] = this.action;     /** 操作 */
        cc.connect.eventlist['hideAction'] = this.hideAction;     /** 隐藏操作 */
        cc.connect.eventlist['eventErr'] = this.eventErr;         /** 错误 */
        cc.connect.eventlist['turn'] = this.turn;                 /** 轮转 */
        cc.connect.eventlist['otherHolds'] = this.otherHolds;     /** 其他人手牌 */
        cc.connect.eventlist['actionHu'] = this.actionHu;         /** 胡牌操作 播放胡动画*/
        cc.connect.eventlist['lastQiPoker'] = this.lastQiPoker;   /** 显示最后一张弃牌*/
        cc.connect.eventlist['gangScore'] = this.gangScore;       /** 杠喜钱*/
        cc.connect.eventlist['zhaniao'] = this.zhaniao;           /** 扎鸟*/
        this.initEvents();
    };

    /**
     * 广播庄家
     * @param {*} data 
     */
    broadcastBanker (data) {
        this.cclog("广播庄家 broadcastBanker = ", data);
        this._model.broadcastBanker(data);
    }

    /**
     * 剩余牌数目
     * @param {*} data 
     */
    bottomCards (data) {
        this.cclog("剩余牌数目 bottomCards = ", data);
        this._model.bottomCards(data);
    }

    /**
     * 手牌
     * @param {*} data 
     */
    holds (data) {
        this.cclog("发牌 holds = ", data);
        this._model.holds(data);
    }

    /**
     * 庄家最后一张牌
     * @param {*} data 
     */
    bankLastcard (data) {
        this.cclog("庄家最后一张牌 bankLastcard = ", data);
        this._model.bankLastcard(data);
    }

    /**
     * 出牌
     * @param {*} data 
     */
    discard (data) {
        this.cclog("出牌 discard = ", data);
        this._model.discard(data);
    }

    /**
     * 进牌
     * @param {*} data 
     */
    inPoker (data) {
        this.cclog("进牌 inPoker = ", data);
        this._model.inPoker(data);
    }

    /**
     * 弃牌
     * @param {*} data 
     */
    qiPoker (data) {
        this.cclog("弃牌 qiPoker = ", data);
        this._model.qiPoker(data);
    }

    /**
     * 摸牌
     * @param {*} data 
     */
    drawCard (data) {
        this.cclog("摸牌 drawCard = ", data);
        this._model.drawCard(data);
    }

    /**
     * 操作
     * @param {*} data 
     */
    action (data) {
        this.cclog("操作 action = ", data);
        this._model.action(data);
    }

    /**
     * 隐藏操作
     * @param {*} data 
     */
    hideAction (data) {
        this.cclog("隐藏操作 hideAction = ", data);
        this._model.hideAction(data);
    }

    /**
     * 事件错误
     * @param {*} data 
     */
    eventErr (data) {
        this.cclog("事件错误 eventErr = ", data);
        this._model.eventErr(data);
    }

    /**
     * 轮转
     * @param {*} data 
     */
    turn (data) {
        this.cclog("轮转 turn = ", data);
        this._model.turn(data);
    }

    /**
     * 其他人手牌
     * @param {*} data 
     */
    otherHolds (data) { 
        this.cclog("其他人手牌 otherHolds = ", data);
        this._model.otherHolds(data);
    }

    /**
     * 胡牌操作 播放胡动画
     * @param {*} data 
     */
    actionHu (data) { 
        this.cclog("胡牌操作 播放胡动画 actionHu = ", data);
        this._model.actionHu(data);
    }

    /**
     * 最后一张弃牌
     * @param {*} data 
     */
    lastQiPoker (data) { 
        this.cclog("最后一张弃牌 lastQiPoker = ", data);
        this._model.lastQiPoker(data);
    }

    /**
     * 杠喜钱
     * @param {*} data 
     */
    gangScore (data) { 
        this.cclog("杠喜钱 gangScore = ", data);
        this._model.gangScore(data);
    }

    /**
     * 扎鸟
     * @param {*} data 
     */
     zhaniao (data) { 
        this.cclog("扎鸟 zhaniao = ", data);
        this._model.zhaniao(data);
    }
}

module.exports = mj_hz_net;
