/** * Created by apple on 2017/10/27. */let BaseRoom = require('./BaseRoom');let BaseRoomRule = require(`./BaseRoomRule`);let notifyHall = require('./notifyHall');class RoomPool{    constructor(){        this.pool = {};    }    /**     * 获取房间对象     * @param rid     * @returns {Room}     */    getRoom(rid){        return this.pool[rid];    }    //创建一个房间    addRoom(options, roomRule, gameRule, app){        let path = options.gameName.replace('_', "/");        let roomClassPath = `../games/${path}/Room`;        let room, _roomRule, _gameRule;        /************ 房间规则 ****************/        try{            let RoomRuleClass = require(`../games/${path}/RoomRule`);            _roomRule = new RoomRuleClass(roomRule);        }catch (e) {            _roomRule = new BaseRoomRule(roomRule);        }        /************ 游戏规则 ****************/        try{            let GameRuleClass = require(`../games/${path}/GameRule`);            _gameRule = new GameRuleClass(gameRule);        } catch (e) {            _gameRule = gameRule;        }        /************ 创建房间 ****************/        try{            let ClassRoom = require(roomClassPath);            room = new ClassRoom(options, _roomRule, _gameRule, app, this);        } catch (e) {            room = new BaseRoom(options, _roomRule, _gameRule, app, this);        }        this.pool[options.rid] = room;    }    /**     * 获得房间数     * @returns {number}     */    getCount(){        return Object.keys(this.pool).length;    }    /***     * 释放房间     */    destroyRoom(rid){        let room = this.pool[rid];        if(room){            room.onDestroy();            delete this.pool[rid];        }        notifyHall.delRoom(room.app, rid);    }    /**     * 获取房间信息     */    getUidByRoomInfo(uid){        let info = {};        for(let rid in this.pool){            let room = this.pool[rid];            if(room.creator == uid){                info[rid] = {                    gameType:room.type,                    rule:room.rule,                    count:room.getSeatsCount()                };            }        }        return info;    }    /**     * 获取用户信息     * @param uid     * @returns {{score: *, giveScore: (number|*), name: *, pic: *, sex: (string|*), location: *}}     */    getUserInfo(uid){        for(let rid in this.pool){            let room = this.pool[rid];            let player = room.player(uid);            if(player){                return {                    score: player.score,                    giveScore: player.giveScore,                    name: player.name,                    pic: player.pic,                    sex: player.sex,                    location: player.location                }            }        }    }}//房间池为单例对象let pool = new RoomPool();module.exports = pool;