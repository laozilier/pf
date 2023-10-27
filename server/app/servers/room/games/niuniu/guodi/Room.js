/**
 *  创建者： THB
 *  日期：2020/3/7
 */

class Room extends require('../../../room/BaseRoom'){
    constructor(options, roomRule, gameRule, app, pool) {
        super(options, roomRule, gameRule, app, pool);

        this.alreadyShouzhuang = true;
    }

    /**
     * 收到收庄消息
     * @param uid
     * @param shou
     * @param need  是否需要重新检查出场限制
     */
    res_shouzhuang(uid, shou, need) {
        /** 如果已经收过了 则不能再收 **/
        if (!!this.alreadyShouzhuang) {
            return;
        }

        /** 如果不是庄在收 则不能收 **/
        if (this.zuid != uid) {
            return;
        }

        if (!this.sd.canShouZhuang) {
            return;
        }

        this.alreadyShouzhuang = true;

        /** 收庄 **/
        if (shou) {
            this.session.sendAll('shouzhuang', [this.zuid, this.sd.guodi]);
            this.setSDData();
            if (need) {
                /** 检查庄分数 是否要踢出 **/
                this.singleFilterPlayer(this.player(this.zuid));
            }
        }
    }

    setSDData(reset) {
        this.sd.zuid = undefined;
        this.sd.zhuangInning = 0;
        this.sd.canlianzhuang = false;
        this.sd.zcount = 0;
        this.sd.guodi = 0;
        this.sd.canShouZhuang = false;
        if (reset) {
            this.sd.lastzuid = undefined;
            this.sd.lastuids = undefined;
        }
    }

    singleFilterPlayer(player) {
        if (player) {
            let minScore = this.gameConfig.leaveScore(this.gameRule);
            let maxScore = undefined;
            if (this.cid == 0) {
                maxScore = this.gameConfig.maxLeaveScore(this.gameRule);
            }
            /** 掉线 并且达到离开条件才会踢掉 **/
            if (player.leaveLimit(true, minScore, maxScore) == 0) {
                this.session.sendAll('leave', player.uid);
                this.delPlayer(player);
            }
        }
    }

    /**
     * 返回玩家类
     * @returns {BasePlayer}
     */
    getClassPlayer(){
        return require('./RoomPlayer');
    }

    async pushScore() {
        this.alreadyShouzhuang = false;
        /** 玩家输赢分数 */
        let resultScore = this.gameScript.getScoreResult();
        /** 先判断庄家除掉锅底的钱 剩余的钱够不够抽水 如果不够 锅底的钱要减少 然后该进进 该出出 **/
        let zuid = resultScore.zuid;
        this.zuid = zuid;
        let zplayer = this.player(zuid);
        let ztaxmargin = zplayer.getActualScore()-(this.tax+this.sd.guodi);
        if (ztaxmargin < 0) {
            this.sd.guodi -= Math.abs(ztaxmargin);
        }

        /** 输家扣除水钱后 最多有多少输多少 **/
        let lose = resultScore.lose;
        lose.forEach(el => {
            let player = this.player(el.uid);
            let actual = player.getActualScore() - this.tax;
            actual = (actual >= el.score ? el.score : actual);
            player.score -= actual;
            player.singleScore -= actual;
            player.reduceScore(this.tax);

            this.sd.guodi += actual;
            zplayer.singleScore += actual;
            zplayer.score += actual;
        });

        /** 赢家扣除水钱后 最多有多少赢多少 从大到小依次赢取 并且不能超过锅底的钱 **/
        let win = resultScore.win;
        win.forEach(el => {
            let player = this.player(el.uid);
            let actual = player.getActualScore();
            actual = Math.min((actual+this.tax), el.score);
            actual = Math.min(this.sd.guodi, actual);
            player.score += actual;
            player.singleScore += actual;
            player.reduceScore(this.tax);

            this.sd.guodi -= actual;
            zplayer.singleScore -= actual;
            zplayer.score -= actual;
        });

        zplayer.reduceScore(this.tax);

        /** 分数变化写入数据库，并且获取修改后的结果 */
        let scoreList = [];
        let actualScores = {};
        let finalScoreList = {};
        let uids = this.gameScript.uids;
        uids.forEach(uid => {
            let player = this.player(uid);
            scoreList.push({uid: player.uid, score: player.singleScore});
            actualScores[uid] = player.singleScore;
            finalScoreList[uid] = player.getActualScore();
        });

        await this.writeScore(scoreList, this.tax);
        this.session.sendAll("finalScores", finalScoreList);
        this.sd.guodi = Math.min(finalScoreList[zuid], this.sd.guodi);
        this.actualScores = actualScores;
        this.finalScoreList = finalScoreList;

        return actualScores;
    }
}

module.exports = Room;