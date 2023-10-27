/**
 * Created by apple on 2017/9/18.
 */

/**
 * 房间池
 * @type {RoomPool}
 * */
let roomPool = null;

let Handler = function (app) {
    this.app = app;
    //初始化
    roomPool = require('../room/RoomPool');
};
let handler = Handler.prototype;


handler.login = async function (params, cb){
    let rid = params.rid;
    let uid = params.uid;
    let room = roomPool.getRoom(rid);
    if(room){
        room.login(uid, params.frontendId, "127.0.0.1");
    }
    cb(null);
};

/**
 * 加入房间
 * @param params
 * @param cb
 * @returns {Promise<void>}
 */
handler.joinRoom = async function (params, cb){
    let rid = params.rid;
    let uid = params.uid;
    let room = roomPool.getRoom(rid);
    if (!room) {
        cb(null, {code: STATE_CODE.roomNotExists});
    } else {
        let userData = await DBTOOLS.getUserInfoByUid(uid);
        if (!userData) {
            return cb(null, {code: STATE_CODE.userNotExists});
        }
        room.join(userData);
        room.login(uid, params.frontendId, "127.0.0.1");
        cb(null, {
            code: STATE_CODE.OK,
            gameName: room.gameName, //游戏类型
            seats: room.seats.length
        });
    }
};

/**
 * 强制解散房间
 * @param rid
 * @param cb
 */
handler.dismissRoom = function (rid, cb) {
    let room = roomPool.getRoom(rid);
    if (room) {
        room.dismiss();
    }
    cb(null, {code: STATE_CODE.OK});
};

/**
 * 创建房间
 * @param options
 * @param cb
 */
handler.createRoom = function (options, roomRule, gameRule, cb) {
    try{
        roomPool.addRoom(options, roomRule, gameRule, this.app);
        cb(null, {code: STATE_CODE.OK});
    } catch (e) {
        APP_LOG.error(e);
        cb(null, {code: STATE_CODE.createRoomFail});
    }
};

//房间信息
handler.roomInfo = function (rid, cb){
    let room = roomPool.getRoom(rid);
    if(!room){
        cb(null, {code: STATE_CODE.roomNotExists});
    } else {
        cb(null, {
            code: STATE_CODE.OK,
            result:{
                gameName: room.gameName,
                gameRule: room.gameRule,
                roomRule: room.roomRule,
                seatCount: room.getSeatsCount(),
                playerCount: room.players.length
            }
        });
    }
};

//将玩家踢出房间
handler.kickPlayer = function (rid, uid, cb){
    let room = roomPool.getRoom(rid);
    if(!room){
        cb(null, {code: STATE_CODE.roomNotExists});
    } else {
        room.kickPlayer(uid);
        cb(null, {code: STATE_CODE.OK});
    }
};

handler.changeServerStatus = function(parmas, cb) {
    SERVER_PARAMS = parmas;
    cb(null, {code: STATE_CODE.OK});
};

/**
 * 玩家离线
 * @param uid
 * @param rid
 * @param cb
 */
handler.userLeave = function (uid, rid, cb) {
    let room = roomPool.getRoom(rid);
    if (room) {
        let play = room.player(uid);
        play && play.emit('disconnect');
    }
    cb(null, true);
};

module.exports = function (app) {
    return new Handler(app);
};