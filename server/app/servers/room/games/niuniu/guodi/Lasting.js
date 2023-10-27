/**
 * 牛牛持久层
 * Created by THB on 2018/8/7
 */


class GuodiLasting extends require('../BaseLasting'){
    constructor() {
        super();
        this.guodi = 0;  //锅底金币
        this.zuid;
        this.lastzuid;
        this.lastuids;
        this.zhuangInning = 0;
        this.zcount = 0;
        this.canShouZhuang = false;
    }

    dataRequiredByClient(){
        return {
            players: this.players
        }
    }
}

module.exports = GuodiLasting;