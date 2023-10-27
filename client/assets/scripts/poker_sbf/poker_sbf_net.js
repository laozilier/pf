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

class Poker_sbf_net extends Game_net {
    constructor(model) {
        super(model);

        cc.connect.eventlist['holds'] = this.holdArrays;          /** 游戏手牌 */
        cc.connect.eventlist['turn'] = this.turn;                 /** 轮转 */
        cc.connect.eventlist['discard'] = this.discard;           /** 出牌*/
        cc.connect.eventlist['cutCard'] = this.qieCard;           /** 切牌 */
        cc.connect.eventlist['broadcastBanker'] = this.broadcastBanker;   /** 庄家*/
        cc.connect.eventlist['ask_jiaozhu'] = this.askjiaozhu;            /**询问叫主 */
        cc.connect.eventlist['ask_fanzhu'] = this.askfanzhu;              /**询问反主 */
        cc.connect.eventlist['jiaozhu'] = this.jiaozhu;                   /**叫主 */
        cc.connect.eventlist['fanzhu'] = this.fanzhu;                     /**反主 */
        cc.connect.eventlist['giveup'] = this.giveup;                     /**放弃反主 */
        cc.connect.eventlist['ask_cutCard'] = this.askcutCard;            /**询问切牌 */
        cc.connect.eventlist['getScore'] = this.getScore;                 /**玩家得分 */
        cc.connect.eventlist['lastDiscards'] = this.lastDiscards;         /**上一轮牌 */

        this.initEvents();
    };

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
    getScore(data) {
        this.cclog("闲家捡分 getScore:",data);
        this._model.getScore(data);
    }

    /**
     * 询问反主
     * @param data
     * */
    askfanzhu(data) {
        this.cclog("询问反主 askfanzhu:",data);
        this._model.askfanzhu(data);
    }


    /**
     * 取消反主
     * @param data
     * */
    cancelfanzhu(data) {
        this.cclog("取消反主 cancelfanzhu:",data);
        this._model.cancelfanzhu(data);
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
     * * 询问叫主
     *  @param data
     * */
    askjiaozhu(data) {
        this.cclog("询问叫主 askjiaozhu:",data);
        this._model.askjiaozhu(data);
    }

    /**
     * * 取消叫主
     *  @param data
     * */
    canceljiaozhu(data) {
        this.cclog("取消叫主 canceljiaozhu:",data);
        this._model.canceljiaozhu(data);
    }

    /**
     * * 叫主
     *  @param data
     * */
    jiaozhu(data) {
        this.cclog("叫主 jiaozhu:",data);
        this._model.jiaozhu(data);
    }

    /**
     * * 反主
     *  @param data
     * */
    fanzhu(data) {
        this.cclog("反主 fanzhu:",data);
        this._model.fanzhu(data);
    }

    /**
     * * 放弃反主
     *  @param data
     * */
    giveup(data) {
        this.cclog("放弃反主 giveup:",data);
        this._model.giveup(data);
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

module.exports = Poker_sbf_net;
