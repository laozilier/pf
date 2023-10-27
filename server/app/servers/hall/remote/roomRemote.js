/**
 *  创建者： THB
 *  日期：2020/4/14
 */

function RoomRemote(app){
    this.app = app;
}
let handler = RoomRemote.prototype;

// 玩家坐下
handler.sitDown = function (rid, seatId, uid, name, pic, cb){
    let r = ROOMS.getRoom(rid);
    r && r.sitDown(seatId, uid, name, pic);
    cb(null);
};

//玩家离开房间
handler.delPlayer = function (rid, uid, cb) {
    let r = ROOMS.getRoom(rid);
    r && r.delPlayer(uid);
    cb(null);
};

//删除房间
handler.delRoom = function (rid, cb) {
    ROOMS.delRoom(rid);
    cb(null);
};

module.exports = function (app) {
    return new RoomRemote(app);
};