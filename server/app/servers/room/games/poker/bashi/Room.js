/**
 *  创建者： THB
 *  日期：2020/3/7
 */

class Room extends require('../../../room/BaseRoom'){
    constructor(options, roomRule, gameRule, app, pool) {
        super(options, roomRule, gameRule, app, pool);

    }

    /**
     * 返回玩家类
     * @returns {BasePlayer}
     */
    getClassPlayer() {
        return require('./RoomPlayer');
    }

    /**
     *
     * @param seat1
     * @param seat2
     */
    checkChangeSeat(seat1, seat2) {
        let p1 = this.seats[seat1];
        p1.seatId = seat2;
        let p2 = this.seats[seat2];
        p2.seatId = seat1;
        this.seats[seat1] = p2;
        this.seats[seat2] = p1;
    }
}

module.exports = Room;