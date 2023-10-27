/**
 *
 * Created by THB on 2018/8/14
 */


class PDKLasting extends require('../BaseLasting'){
    constructor() {
        super();
        this.winnerUid = 0; //上一把赢家uid
    }

    dataRequiredByClient(){
        return {
            winnerUid: this.winnerUid
        }
    }
}

module.exports = PDKLasting;