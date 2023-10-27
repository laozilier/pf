class sbfEvent extends require('../../BaseEvent') {
    constructor() {
        super();

        this.gameStatus = "gameStatus";     //状态切换
        this.ask_jiaozhu = "ask_jiaozhu";   //询问叫主
        this.ask_fanzhu = "ask_fanzhu";     //询问反主

        this.broadcastBanker = "broadcastBanker";
        this.ask_cutCard = "ask_cutCard";   //询问切牌
        this.cutCard = "cutCard";           //切牌
        this.jiaozhu = "jiaozhu";           //叫主
        this.fanzhu = "fanzhu";             //反主
        this.giveup = "giveup";             //放弃反主
        this.discard = "discard";           //出牌
        this.getScore = "getScore";         //得分
        this.lastDiscards = "lastDiscards"; //最后一手牌
    }
}
module.exports = new sbfEvent();