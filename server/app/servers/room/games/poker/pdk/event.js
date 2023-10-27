class PdkEvent extends require('../../BaseEvent') {
    constructor() {
        super();

        this.discard = "discard";
        this.cutCard = "cutCard";
        this.pass = "pass";
        this.alert = "alert";
        this.ask_cutCard = "ask_cutCard";
        this.broadcastBanker = "broadcastBanker";
        this.localCardNum = "localCardNum";
        this.bomb_score = "bomb_score";
        this.heitao3 = "heitao3";
    }
}
module.exports = new PdkEvent();