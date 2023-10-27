class Fruit_Event extends require('../../BaseEvent') {
    constructor() {
        super();
        this.gameStatus = "gameStatus"; //状态切换
        this.poolScore = "poolScore";   //奖池
        this.bet = "bet";               //下注
        this.reward = "reward";         //中奖
    }
}
module.exports = new Fruit_Event();