class Chz_Event extends require('../../BaseEvent') {
    constructor() {
        super();
        this.gameStatus = "gameStatus";             //状态切换
        this.broadcastBanker = "broadcastBanker";   //广播庄家
        this.bankLastcard = "bankLastcard";         //庄家最后一张牌
        this.bandian = "bandian";                   //搬点
        this.askPiaofen = "askPiaofen";             //询问飘分
        this.piaofen = "piaofen";                   //飘分
        this.discard = "discard";                   //出牌
        this.drawCard = "drawCard";
        this.action = "action";
        this.inPoker = "inPoker";
        this.qiPai = "qiPai";
        this.liuju = "liuju";
        this.bottomCards = "bottomCards";
        this.fanxing = "fanxing";
        this.actionHu = "actionHu";
        this.sishou = "sishou";
        this.hideAction = "hideAction";
        this.addHolds = "addHolds";
        this.discardErr = "discardErr";
    }
}
module.exports = new Chz_Event();