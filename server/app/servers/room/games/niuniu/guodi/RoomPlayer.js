/**
 *  创建者： THB
 *  日期：2020/3/7
 */
class RoomPlayer extends require('../../../room/BasePlayer'){
    constructor(user, roomObj) {
        super(user, roomObj);

        this.on('res_shouzhuang', this.res_shouzhuang);
    }

    /**
     * 收庄
     */
    res_shouzhuang(data) {
        this.roomObj.res_shouzhuang(this.uid, data, true);
    }

    /**
     * 玩家主动离开 主要判断庄家
     */
    leave() {
        let sd = this.roomObj.sd;
        if (sd.zuid == this.uid) {
            if (this.roomObj.getSeatsCount() > 1) {
                this.send('toast', '你还没下庄或收庄');
                return;
            } else {
                this.roomObj.res_shouzhuang(this.uid, true);
            }
        }

        super.leave();
    }

    /**
     * 检查出场限制
     * @param auto      是否是每局结束后的自动检查
     * @param minScore  被踢出场最小分数
     * @param maxScore  被踢出场最大分数
     * @returns {*}
     */
    leaveLimit(auto, minScore, maxScore) {
        let sd = this.roomObj.sd;
        /** 如果是每局结束的自动检查 */
        if (auto) {
            /** 主要检查庄家 如果庄家掉线 **/
            if (sd.zuid === this.uid) {
                if (!this.isOnline && sd.canShouZhuang) {
                    /** 能收庄则自动收庄 然后再继续检查出场 理论上收完就出去了 **/
                    this.roomObj.res_shouzhuang(this.uid, true);
                } else {
                    return -2;
                }
            }
        } else {
            if (sd.zuid === this.uid) {
                return -2;
            }
        }

        return super.leaveLimit(auto, minScore, maxScore);
    }

    disconnect() {
        let sd = this.roomObj.sd;
        /** 主要检查庄家 如果庄家掉线 **/
        if (sd.zuid === this.uid) {
            this.sendAll("isOnline", [this.uid, false]);
            this.isTrusteeship = true;
            this.isOnline = false;
            return;
        }

        super.disconnect();
    }
}

module.exports = RoomPlayer;