/**
 *  创建者： THB
 *  日期：2020/4/8
 *  房间的接口
 */
const hdw = require('../../../../common/handlerMiddleWare');

class RoomHandler {
    constructor(app) {
        this.app = app;
        this.tempRooms = []; //临时房间号
    }

    /**
     * 创建房间
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    createRoom(params, session, next) {
        if (!SERVER_PARAMS.create) {
            return next(null, {code: STATE_CODE.serverStoped});
        }

        if (params.gameName === undefined || params.game_rule === undefined) {
            return next(null, STATE_CODE.lackOfParameters);
        }

        //生成一个房间号
        let rid = Math.randomRange(100000, 999999);
        while (ROOMS.isExists(rid) || !!this.tempRooms[rid]) {
            rid = Math.randomRange(100000, 999999);
        }

        //随机分配一台room服
        this.tempRooms[rid] = true;
        let roomServers = this.app.getServersByType("room");
        let index = Math.randomRange(0, roomServers.length);
        let serverId = roomServers[index].id;

        //创建房间的参数
        this.app.rpc.room.gameRemote.createRoom(serverId, {
                rid: rid,
                uuid: Date.now() + "" + rid,
                gameName: params.gameName,
                creator: session.uid
            },
            params.room_rule,
            params.game_rule,
            (err, res) => {
                if (res.code === STATE_CODE.OK) {
                    ROOMS.addRoom(rid, params, serverId);
                    next(null, {code: STATE_CODE.OK, rid: rid});
                } else {
                    next(null, {code: res.code});
                }
            });
    }

    async joinRoom(params, session, next) {
        if (!SERVER_PARAMS.create) {
            return next(null, {code: STATE_CODE.serverStoped});
        }

        if (params.rid === undefined) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        //首先判断玩家是否在房间中
        let inRoom = ROOMS.getRoomByUid(session.uid);
        if (inRoom) {
            return next(null, {code: STATE_CODE.OK, gameName: inRoom.gameName, seats: inRoom.seats.length});
        }

        //判断要加入的房间是否存在
        let room = ROOMS.getRoom(params.rid);
        if (!room) {
            return next(null, {code: STATE_CODE.roomNotExists});
        }
        //房间服务器是否开启
        if (!room.serverId) {
            return next(null, {code: STATE_CODE.roomServerNotExists});
        }

        //如果此房间是俱乐部中,则判断玩家是否在俱乐部中
        if (room.cid && room.prid) {
            let isExists = await DBTOOLS.getClubUserInfo(session.uid, room.cid);
            if (!isExists) {
                return next(null, {code: STATE_CODE.notClubMember});
            }
        }

        this.app.rpc.room.gameRemote.joinRoom(room.serverId, {
            uid: session.uid,
            rid: params.rid,
            frontendId: session.frontendId
        }, (err, res) => {
            if (parseInt(res.code) !== STATE_CODE.OK) {
                next(null, {code: res.code});
            } else {
                session.set('rid', params.rid);
                session.push('rid', (err) => {
                    if (err) {
                        APP_LOG.error('设置房间号到session service 失败! 错误 : %j', err.stack);
                    }
                    let room = ROOMS.getRoom(params.rid);
                    if (room) {
                        room.addPlayer(session.uid);
                        next(null, {
                            code: STATE_CODE.OK,
                            gameName: res.gameName,
                            seats: res.seats
                        });
                    } else {
                        next(null, {
                            code: STATE_CODE.roomNotExists
                        });
                    }
                });
            }
        });
    }

    async createClubGame(params, session, next, userInfo, clubInfo) {
        if (!SERVER_PARAMS.create) {
            return next(null, {code: STATE_CODE.serverStoped});
        }

        if (params.prid === undefined) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        //黑名单用户无法玩
        if (userInfo.clubBlacklist) {
            return next(null, {code: STATE_CODE.blacklistMember});
        }

        //获取包间规则
        let privateRoom = clubInfo.getPrivateRooms(params.prid);
        if (!privateRoom) {
            return next(null, {code: STATE_CODE.privateRoomsNotExists});
        }
        //判断包间开桌数是否达到最大
        if(privateRoom.max > 0 && ROOMS.getRoomByPRid(params.prid).length >= privateRoom.max){
            return next(null, {code: STATE_CODE.privateRoomISMax});
        }

        if (!privateRoom.rule) {
            return next(null, {code: STATE_CODE.privateRoomsNotExists});
        }

        let rule = {};
        if (typeof privateRoom.rule == 'string') {
            try {
                rule = JSON.parse(privateRoom.rule);
            } catch (e) {
                return next(null, {code: STATE_CODE.notJson});
            }
        } else {
            rule = privateRoom.rule;
        }

        rule.groupId = params.prid;
        rule.cid = params.cid || userInfo.cid;
        rule.prid = params.prid;

        //生成一个房间号
        let rid = Math.randomRange(100000, 999999);
        while (ROOMS.isExists(rid) || !!this.tempRooms[rid]) {
            rid = Math.randomRange(100000, 999999);
        }

        //随机分配一台room服
        this.tempRooms[rid] = true;
        let roomServers = this.app.getServersByType("room");
        let index = Math.randomRange(0, roomServers.length);
        let serverId = roomServers[index].id;
        rule.rid = rid;
        rule.uuid = Date.now() + "" + rid;
        rule.creator = session.uid;
        this.app.rpc.room.gameRemote.createRoom(serverId, rule, rule.room_rule, rule.game_rule, (err, res) => {
            if (res.code === STATE_CODE.OK) {
                ROOMS.addRoom(rid, rule, serverId);
                next(null, {code: STATE_CODE.OK, rid: rid});
            } else {
                next(null, {code: res.code});
            }
        });
    }

    /**
     * 房间信息，俱乐部管理员在解散房间时需要调用此接口查看房间信息
     * @param params
     * @param session
     * @param next
     * @returns {Promise<*>}
     */
    async roomInfo(params, session, next) {
        if (!params.rid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        //判断要加入的房间是否存在
        let room = ROOMS.getRoom(params.rid);
        if (!room) {
            return next(null, {code: STATE_CODE.roomNotExists});
        }

        this.app.rpc.room.gameRemote.roomInfo(room.serverId, params.rid, (err, res) => {
            next(null, res);
        });
    }

    //俱乐部管理员解散房间
    async clubDismissRoom(params, session, next){
        if(!params.rid || !params.cid){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let club = CLUBS.getClub(null, params.cid);
        let room = ROOMS.getRoom(params.rid);
        if(!room){
            return next(null, {code: STATE_CODE.roomNotExists});
        }
        if(club.admins[session.uid] > 0){
            this.app.rpc.room.gameRemote.dismissRoom(room.serverId, params.rid, (err, res) => {
                next(null, res);
            });
        } else {
            next(null, {code: STATE_CODE.notAdmin});
        }

    }
}


module.exports = function (app) {
    // return new RoomHandler(app);
    return hdw.handlerMiddleware(app, RoomHandler, hdw.checkUid);
};