/**
 * 牛牛持久层
 * Created by THB on 2018/8/7
 */


class Lasting extends require('../BaseLasting'){
    constructor() {
        super();
        this.winner = 0; //上一把赢家uid
    }

    dataRequiredByClient(){
        return {
            winner: this.winner
        }
    }
}

module.exports = Lasting;