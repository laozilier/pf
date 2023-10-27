class qianfenEvent extends require('../../BaseEvent') {
    constructor() {
        super();
        this.gameStatus = "gameStatus";     //状态切换
        this.cutCard = "cutCard";           //切牌
        this.discard = "discard";           //出牌
        this.pass = "pass";                 //不要
        this.broadcastBanker = "broadcastBanker";//广播庄家
        this.asyncScore = "asyncScore";     //同步分数
        this.rank = "rank";                 //排名
        this.ask_cutCard = "ask_cutCard";
        this.bottomCards = "bottomCards";
    }
}
module.exports = new qianfenEvent();