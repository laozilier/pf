class MJEvent extends require('../BaseEvent') {
    constructor() {
        super();
        this.discard = "discard";       //出牌
        this.chow = "chow";        //吃
        this.pong = "pong";
        this.kong = "kong";
        this.hu = "hu";
        this.pass = "pass";
        this.operator = 'operator';
        this.drawCard = 'drawCard';
        this.surplusMahjong = 'surplusMahjong';
        this.hideOperator = 'hideOperator';
    }
}
module.exports = new MJEvent();