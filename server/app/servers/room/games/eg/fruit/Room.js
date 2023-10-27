/**
 *  创建者： THB
 *  日期：2020/3/7
 */

class Room extends require('../../../room/BaseRoom'){
    constructor(options, roomRule, gameRule, app, pool) {
        super(options, roomRule, gameRule, app, pool);

    }

    async pushScore() {
        /** 分数变化写入数据库，并且获取修改后的结果 */
        let scoreList = [];
        let actualScores = {};
        let finalScoreList = {};
        let uids = this.gameScript.uids;
        for (let i = 0; i < uids.length; i++) {
            let uid = uids[i];
            let gamePlayer = this.gamePlayer(uid);
            if (!!gamePlayer.betData && gamePlayer.betData.length > 0) {
                let score = gamePlayer.score;
                let player = this.player(uid);
                player.score += score;
                scoreList.push({uid: player.uid, score: score});
                actualScores[uid] = gamePlayer.score;
                finalScoreList[uid] = player.getActualScore();
            }
        }

        if (scoreList.length > 0) {
            await this.writeScore(scoreList, this.tax);
            let sql = `UPDATE t_wallet SET score = ${POOLSCORE.score} WHERE uid = ${923895} LIMIT 1`;
            await DB_POOL.querySync(sql);
            this.session.sendAll("finalScores", finalScoreList);
        }

        this.actualScores = actualScores;
        this.finalScoreList = finalScoreList;

        return actualScores;
    }
}

module.exports = Room;