/**
 *
 * Created by THB on 2018/8/14
 */


class QianFenLasting extends require('../../BaseLasting'){
    constructor() {
        super();

        this.settled = true;
        this.winner = -1;       //上一把的上游
        this.loster = -1;       //上一局的下游
        this.totalScore = {};   //累计积分
        this.totalXiScore = {}; //累计喜分
        this.inning = 0;
    }

    initPlayerData(uids) {
        this.settled = false;
        if (Object.keys(this.totalScore).length != uids.length) {
            uids.forEach(uid=> {
                this.totalScore[uid] = 0;
                this.totalXiScore[uid] = 0;
            });
        }
    }

    clear () {
        this.settled = true;
        this.winner = -1;       //上一把的上游
        this.loster = -1;       //上一局的下游
        this.totalScore = {};   //累计积分
        this.totalXiScore = {}; //累计喜分
        this.inning = 0;
    }

    dataRequiredByClient() {
        return {
            winnerUid: this.winnerUid
        }
    }
}

module.exports = QianFenLasting;