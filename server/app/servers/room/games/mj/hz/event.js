class Hz_Event extends require('../../BaseEvent') {
    constructor() {
        super();
        this.gameStatus = "gameStatus";             //状态切换
        this.broadcastBanker = "broadcastBanker";   //广播庄家
        this.bankLastcard = "bankLastcard";         //庄家最后一张牌
        this.discard = "discard";                   //出牌
        this.drawCard = "drawCard";                 //摸牌
        this.action = "action";                     //发送操作
        this.inPoker = "inPoker";                   //进牌
        this.qiPai = "qiPai";                       //弃牌
        this.liuju = "liuju";                       //流局
        this.bottomCards = "bottomCards";           //底牌数量
        this.actionHu = "actionHu";                 //操作胡牌
        this.hideAction = "hideAction";             //隐藏操作
        this.discardErr = "discardErr";             //出牌错误
        this.otherHolds = "otherHolds";             //其他人手牌
        this.lastQiPoker = "lastQiPoker";           //最后一张弃牌
        this.gangScore = "gangScore";               //杠喜钱
        this.zhaniao = "zhaniao";                   //扎鸟
    }
}
module.exports = new Hz_Event();