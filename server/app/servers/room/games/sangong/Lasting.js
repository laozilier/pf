/**
 * 牛牛持久层
 * Created by THB on 2018/8/7
 */


class SangongLasting extends require('../BaseLasting'){
    constructor() {
        super();
        //整副牌
        this.cards = undefined;
        //玩家
        this.players = undefined;
    }

    dataRequiredByClient(){
        return {
            players: this.players
        }
    }
}

module.exports = SangongLasting;