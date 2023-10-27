/**
 *  创建者： THB
 *  日期：2020/4/8
 */
const clubs = require('./clubs');

const BaseConfig = require('../room/games/BaseConfig');

class RoomItem {
    constructor(rid, data, serverId) {
        this.rid = rid;  //房间号
        let room_rule = data.room_rule;
        this.startNumber = room_rule.startNumber;
        this.creator = parseInt(data.creator);  //创建者uid
        this.gameName = data.gameName;  //游戏名
        this.game_rule = data.game_rule;  //游戏规则
        this.currInning = 1;
        this.halfway = room_rule.halfway;      //是否中途加入
        this.cid = data.cid;              //俱乐部id
        this.prid = data.prid;            //包间id
        this.groupId = data.groupId;      //房间类型

        this.players = {};  //房间所有玩家
        /**最大玩家数量*/
        let componentPath = '../room/games/' + data.gameName.replace('_', "/") + "/";
        let gameConfig = require(componentPath + "config");
        if (!gameConfig) { //找不到组件，则使用默认组件
            gameConfig = new BaseConfig();
        }
        let playerMax = gameConfig.playerMax[parseInt(room_rule.playerMax) || 0];
        /** 座位列表,坐下的玩家 */
        this.seats = new Array(playerMax);

        this.serverId = serverId; //房间所在room服id
    }

    /**
     * 玩家进入房间
     * @param rid
     * @param uid
     */
    addPlayer(uid){
        this.players[uid] = true;
    }

    /**
     * 玩家坐下
     * @param seatId
     * @param uid
     * @param name
     * @param pic
     */
    sitDown(seatId, uid, name, pic){
        this.seats[seatId] = {
            uid: uid,
            name: name,
            pic: pic
        };


        let clubInfo = clubs.getClub(null, this.cid);
        if(clubInfo){
            clubInfo.sendAll("ctSitDown", {
                cid: this.cid,
                rid: this.rid,
                seatId,
                pic,
                prid: this.prid
            });
        }
    }

    delPlayer(uid){
        if(this.players[uid]){
            delete this.players[uid];
            for(let seatId in this.seats){
                if(this.seats[seatId]){
                    if(this.seats[seatId].uid == uid) {
                        this.seats[seatId] = null;
                        let clubInfo = clubs.getClub(null, this.cid);
                        if(clubInfo)
                            clubInfo.sendAll("ctDelPlayer", {
                                seatId: seatId,
                                prid: this.prid,
                                rid: this.rid
                                });
                        break;
                    }
                }
            }
        }
    }

    isPlayer(uid){
        return !!this.players[uid];
    }

    isSeatFull(){
        return this.seats.length === this.getSeatsCount()
    }

    getSeatsCount(){
        let c = 0;
        for (let i = 0; i < this.seats.length; ++i) {
            this.seats[i] && (c++);
        }
        return c;
    }

    getCount(){
        return Object.keys(this.players).length;
    }
}

class Rooms{
    constructor() {
        this.roomMap = {};
    }

    isExists(rid){
        return !!this.roomMap[rid];
    }

    addRoom(rid, data, serverId){
        this.roomMap[rid] = new RoomItem(rid, data, serverId);
        if(data.cid){
            let clubInfo = clubs.getClub(null, data.cid);
            if(clubInfo){
                clubInfo.sendAll("ctCreateRoom", {
                    cid: data.cid,
                    rid: rid,
                    prid: data.prid,
                });
            }
        }

        APP_LOG.log("房间数量：" + Object.keys(this.roomMap).length);
        return this.roomMap[rid];
    }

    delRoom(rid){
        let room = this.roomMap[rid];
        if(room && room.cid){
            let clubInfo = clubs.getClub(null, room.cid);
            if(clubInfo){
                clubInfo.sendAll("ctDelRoom", {
                    cid: room.cid,
                    rid,
                    prid: room.prid
                });
            }
        }
        delete this.roomMap[rid];
        APP_LOG.log(`房间数量：${Object.keys(this.roomMap).length}`);
    }

    /**
     * 根据包间id获取房间列表
     * @param prid
     */
    getRoomByPRid(prid){
        let list = [];
        for(let rid in this.roomMap){
            if(this.roomMap[rid].prid === prid){
                list.push(this.roomMap[rid]);
            }
        }
        return list;
    }

    /**
     *
     * @param rid
     * @returns {RoomItem}
     */
    getRoom(rid){
        return this.roomMap[rid];
    }

    /**
     * 查找此uid在哪个房间中
     * @param uid
     * @returns {RoomItem}
     */
    getRoomByUid(uid){
        for(let rid in this.roomMap){
            if(this.roomMap[rid].players[uid]){
                    return this.roomMap[rid];
            }
        }
        return null;
    }
}

module.exports = new Rooms();