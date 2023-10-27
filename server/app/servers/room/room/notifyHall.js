/**
 *  创建者： THB
 *  日期：2020/4/14
 */
class NotifyHall {
    constructor() {}

    sitDown(app, rid, seatId, uid, name, pic, cb){
        app.rpc.hall.roomRemote.sitDown(0, rid, seatId, uid, name, pic, function (err) {
            cb && cb(err);
        });
    }

    delPlayer(app, rid, uid, cb){
        app.rpc.hall.roomRemote.delPlayer(0, rid, uid, function (err) {
            cb && cb(err);
        });
    }

    delRoom(app, rid, cb){
        app.rpc.hall.roomRemote.delRoom(0, rid, function (err) {
            cb && cb(err);
        });
    }

    //计算返佣
    calculateProfit(app, cid, uids, tax, cb){
        app.rpc.hall.profitRemote.calculate(0, cid, uids, tax, function (err) {
            cb && cb(err);
        });
    }
}

module.exports = new NotifyHall();