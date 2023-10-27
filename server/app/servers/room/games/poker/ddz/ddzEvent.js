class ddzEvent extends require('../../BaseEvent') {
    constructor() {
        super();
        this.gameStatus = "gameStatus";     //状态切换
        this.robBanker = "robBanker";       //抢地主
        this.callScore = "callScore";       //叫分
        this.dealBanker = "dealBanker";     //发地主牌
        this.doubleScore = "doubleScore";   //加倍
        this.brightCard = "brightCard";     //明牌
        this.discard = "discard";           //出牌
        this.pass = "pass";                 //不要
        this.chunTian = "chunTian";         //春天
        this.error = "error";               //错误提示

    }
}
module.exports = new ddzEvent();