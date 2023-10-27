/**
 * Created by apple on 2017/9/18.
 */

function HallRemote(app) {
    this.app = app;
}

let handler = HallRemote.prototype;
/**
 * 用户连接上connector服务器后，需要返回用户信息
 * @param uid
 * @param cb
 */
handler.login = async function (uid, frontendId, ip, cb) {
    //如果用户缓存还存在，则删除用户缓存
    if (USERS.isExists(uid)) {
        USERS.removeUser(uid);
    }
    //加载用户信息
    let userInfo = await USERS.addUser(uid, frontendId, ip);
    if (!userInfo) {
        return cb(null);
    }
    //加载俱乐部信息
    await CLUBS.getClubSync(this.app, userInfo.cid);

    //加载房间信息
    let room = ROOMS.getRoomByUid(userInfo.uid);
    let roomInfo = undefined;
    if (room) {
        roomInfo = {
            rid: room.rid,
            gameName: room.gameName,
            playerMax: room.seats.length
        };
        this.app.rpc.room.gameRemote.login(room.serverId, {
            uid: uid,
            rid: room.rid,
            frontendId: frontendId
        }, (err, res) => {
        });
    }
    cb(null, {
        cid: userInfo.cid,
        uid: userInfo.uid,
        name: userInfo.name,
        sex: userInfo.sex,
        headimg: userInfo.headimg,
        pid: userInfo.inviteCode,
        createTime: userInfo.createTime,
        mobile: userInfo.mobile,
        score: userInfo.score,
        roomInfo: roomInfo,
        profitRatio: userInfo.profitRatio,
        subordinateCount: userInfo.subordinateCount,
        payment: {
            paymentName: userInfo.paymentName,
            paymentUrl: userInfo.paymentUrl
        },
        weChat: {
            nickname: userInfo.wxNickname,
            realname: userInfo.wxRealname,
            headimg: userInfo.wxHeadimg
        },
        permission: userInfo.permission
    });
};

/**
 * 用户离线
 * @param uid 玩家uid
 * @param rid 玩家加入的房间号，可能为空
 * @param cb  回调
 * @returns {Promise<void>}
 */
handler.userLeave = async function (uid, rid, cb) {

    /******************** 通知房间服务器玩家离开 ********************/
    let room = ROOMS.getRoom(rid);
    if (room) {
        this.app.rpc.room.gameRemote.userLeave(room.serverId, uid, rid, (err, res) => {
            if (err) {
                APP_LOG.error(err);
                APP_LOG.log("通知房间层失败");
            }
        });
    }


    /*********************** 踢出玩家订阅的俱乐部消息 ********************/
    for (let key in CLUBS.clubMap) {
        CLUBS.clubMap[key].kickChannel(uid);
    }

    //删除用户缓存
    USERS.removeUser(uid);

    cb(null);
};


module.exports = function (app) {
    return new HallRemote(app);
};