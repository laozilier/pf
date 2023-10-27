class bashiEvent extends require('../../BaseEvent') {
    constructor() {
        super();

        this.gameStatus = "gameStatus";     //状态切换
        this.ask_jiaozhu = "ask_jiaozhu";   //询问叫主
        this.cancel_jiaozhu = "cancel_jiaozhu";   //取消叫主
        this.ask_special_jiaozhu = "ask_special_jiaozhu";   //询问特殊叫主
        this.cancel_special_jiaozhu = "cancel_special_jiaozhu";   //取消特殊叫主
        this.ask_fanzhu = "ask_fanzhu"; //询问反主
        this.cancel_fanzhu = "cancel_fanzhu"; //取消反主

        this.broadcastBanker = "broadcastBanker";
        this.ask_cutCard = "ask_cutCard";           //询问切牌
        this.cutCard = "cutCard";           //切牌
        this.jiaozhu = "jiaozhu";           //叫主
        this.fanzhu = "fanzhu";             //反主
        this.giveup = "giveup";             //放弃反主
        this.dingzhu = "dingzhu";           //定主发送主色
        this.bottmCards = "bottmCards";     //发送底牌
        this.maidi = "maidi";               //埋底
        this.maidiHolds = "maidiHolds";     //埋底后同步手牌
        this.friend = "friend";             //选择队友
        this.discard = "discard";           //出牌
        this.xianScore = "xianScore";       //闲家分数
        this.lastDiscards = "lastDiscards";
        this.liangdi = "liangdi";           //亮底
        this.changeSeat = "changeSeat";     //换位置
    }
}
module.exports = new bashiEvent();