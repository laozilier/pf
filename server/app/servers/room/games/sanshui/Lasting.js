/**
 *
 * Created by T-Vick on 2018/9/18
 */


class Lasting extends require('../BaseLasting'){
    constructor() {
        super();
        this.players = null;
    }

    dataRequiredByClient(){
        return {
            players: this.players
        }
    }
}

module.exports = Lasting;