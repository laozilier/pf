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
    getClassPlayer(){
        return require('./RoomPlayer');
    }
}

module.exports = Room;