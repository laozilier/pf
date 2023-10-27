/**
 *
 * Created by THB on 2018/8/14
 */


class DDZLasting extends require('../../BaseLasting'){
    constructor() {
        super();
        this.winner = null;         //上一把赢家
    }

    dataRequiredByClient(){
        return {
            winnerUid: this.winnerUid
        }
    }
}

module.exports = DDZLasting;