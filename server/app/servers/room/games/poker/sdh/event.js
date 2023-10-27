class SdhEvent extends require('../../BaseEvent') {
    constructor() {
        super();

        this.gameStatus = "gameStatus";     //状态切换
        this.ask_jiaozhu = "ask_jiaofen";   //询问叫分

        this.broadcastBanker = "broadcastBanker";
        this.ask_cutCard = "ask_cutCard";   //询问切牌
        this.cutCard = "cutCard";           //切牌
        this.jiaofen = "jiaofen";           //叫分
        this.dingzhu = "dingzhu";           //定主发送主色
        this.addBottmCards = "addBottmCards";//发送底牌
        this.maidi = "maidi";               //埋底
        this.discard = "discard";           //出牌
        this.xianScore = "xianScore";       //闲家分数
        this.lastDiscards = "lastDiscards";
        this.liangdi = "liangdi";           //亮底
        this.baofu = "baofu";               //报副
        this.liushou = "liushou";           //留守
        this.surrender = "surrender";       //投降
        this.replySurrender = "replySurrender";   //是否同意投降
    }
}
module.exports = new SdhEvent();