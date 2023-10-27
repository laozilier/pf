class NNEvent extends require('../BaseEvent') {
    constructor() {
        super();
        this.randomDeclarering = "randomDeclarering";
        this.randomDeclarer = "randomDeclarer";
        this.rob = "rob";
        this.showHolds = "showHolds";
        this.bet = "bet";
        this.startBet = "startBet";
        this.deal = "deal";
        this.pleaseRob = "pleaseRob";
        this.cannotOut = "cannotOut";
        this.chupai = "chupai";
        this.maPlayer = "maPlayer";
        this.bipai = "bipai";
    }
}
module.exports = new NNEvent();