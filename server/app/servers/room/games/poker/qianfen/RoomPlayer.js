/**
 *  创建者： THB
 *  日期：2020/3/7
 */
class RoomPlayer extends require('../../../room/BasePlayer'){
    constructor(user, roomObj) {
        super(user, roomObj);


    }

    /**
     * 玩家主动离开 需要判断游戏是否结束
     */
    leave() {
        if (this.roomObj.isPlaying(this.uid) && !this.isGameOver()) {
            this.send('toast', '游戏还未结算，不能离开房间');
            return -2;
        }

        super.leave();
    }

    /**
     * 检查出场限制       需要判断游戏是否结束
     * @param auto      是否是每局结束后的自动检查
     * @param minScore  被踢出场最小分数
     * @param maxScore  被踢出场最大分数
     * @returns {*}
     */
    leaveLimit(auto, minScore, maxScore) {
        if (!this.isGameOver()) {
            return -2;
        }

        return super.leaveLimit(auto, minScore, maxScore);
    }

    /***
     * 游戏是否结束（总结算）
     * @returns {boolean}
     */
    isGameOver() {
        let sd = this.roomObj.sd;
        return sd.settled;
    }

    /**
     * 掉线 需要判断游戏是否结束
     */
    disconnect() {
        if (!this.isGameOver()) {
            this.sendAll("isOnline", [this.uid, false]);
            this.isTrusteeship = true;
            this.isOnline = false;
            return;
        }

        super.disconnect();
    }
}

module.exports = RoomPlayer;