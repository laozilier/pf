/**
 *
 * Created by THB on 2018/8/14
 */


class HzLasting extends require('../../BaseLasting'){
    constructor() {
        super();

        this.lastBanker = -1;

    }

    dataRequiredByClient() {
        return {
            winnerUid: this.winnerUid
        }
    }
}

module.exports = HzLasting;