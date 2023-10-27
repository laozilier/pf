/**
 * Created by THB on 2020/05/29.
 */

const hdw = require('../../../../common/handlerMiddleWare');
const utils = require('../../../../common/utils');
const config = require('../../../../config');

class AdminHandler {
    constructor(app) {
        this.app = app;
    }

    //创建俱乐部
    async createClub(params, session, next){
        if(!params.name || isNaN(params.uid)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        if(params.name.length > 120){
            return next(null, {code: STATE_CODE.clubNameLong});
        }
        let res = await DBTOOLS.createClub(params.uid, params.name);
        next(null, res);
    }

    //删除俱乐部
    async deleteClub(params, session, next) {
        if(!params.cid){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.adminDeleteClub(params.cid, session.uid);
        next(null, res);
    }

    /** 获取服务器参数 **/
    async getServerStatus(params, session, next) {
        next(null, {code: STATE_CODE.OK, result: SERVER_PARAMS});
    }

    /** 修改服务器参数 **/
    async changeServerStatus(params, session, next) {
        if (params.key == undefined || params.value == undefined) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        SERVER_PARAMS[params.key] = params.value;
        let roomServers = this.app.getServersByType("room");
        for (let i = 0; i < roomServers.length; i++) {
            let serverId = roomServers[i].id;
            this.app.rpc.room.gameRemote.changeServerStatus(serverId, SERVER_PARAMS, (err, res) => {});
        }

        next(null, {code: STATE_CODE.OK, result: SERVER_PARAMS});
    }

    /** 加分 **/
    async addScore(params, session, next, userInfo){
        if (!SERVER_PARAMS.recharge) {
            return next(null, {code: STATE_CODE.rechargeStoped});
        }

        if(!params.uid || !params.score){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        //是否在房间
        if(ROOMS.getRoomByUid(params.uid)){
            return next(null, {code: STATE_CODE.playingGame});
        }

        let res = await DBTOOLS.adminAddScore(params.uid, session.uid, params.score);
        if(res.code === STATE_CODE.OK){
            let userInfo2 = USERS.getUser(params.uid);
            if(userInfo2){
                userInfo2.score += params.score;
                userInfo2.sendChangeScore(this.app, params.score);
            }
        }
        next(null, res);
    }

    /** 减分 **/
    async decreaseScore(params, session, next, userInfo){
        if (!SERVER_PARAMS.withdraw) {
            return next(null, {code: STATE_CODE.withdrawStoped});
        }

        if(!params.uid || !params.score){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        //是否在房间
        if(ROOMS.getRoomByUid(params.uid)){
            return next(null, {code: STATE_CODE.playingGame});
        }

        //如果没在房间，则可以扣分
        let res = await DBTOOLS.adminDecreaseScore(params.uid, session.uid, params.score);
        if(res.code === STATE_CODE.OK){
            let userInfo2 = USERS.getUser(params.uid);
            if(userInfo2){
                userInfo2.score -= params.score;
                userInfo2.sendChangeScore(this.app, -params.score);
            }
        }
        next(null, res);
    }

    /** 封号 **/
    async sealUpAccount(params, session, next, userInfo) {
        if (isNaN(params.uid) || isNaN(params.sealUp)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.adminSealUpAccount(params.uid, params.sealUp);
        if (res.sealUp === 1) {
            let userInfo = USERS.getUser(params.uid);
            if (userInfo) {
                userInfo.sealUp = true;
            }
            let room = ROOMS.getRoomByUid(params.uid);
            if (room) {
                this.app.rpc.room.gameRemote.kickPlayer(room.serverId, room.rid, params.uid, (err, res) => {});
            }
        }
        next(null, res);
    }

    /** 解散桌子 **/
    async dismissRoom(params, session, next){
        if(!params.rid){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let room = ROOMS.getRoom(params.rid);
        if(!room){
            return next(null, {code: STATE_CODE.roomNotExists});
        }

        this.app.rpc.room.gameRemote.dismissRoom(room.serverId, params.rid, (err, res) => {
            next(null, res);
        });
    }

    /** 历史统计记录 */
    async statistics(params, session, next, userInfo, clubInfo){
        let res = await DBTOOLS.statistics();
        next(null, {code: STATE_CODE.OK, result: res});
    }

    /** 玩家分数效验 **/
    async verifyPlayerScores(params, session, next) {
        let res = await DBTOOLS.verifyPlayerScores();
        next(null, {code: STATE_CODE.OK, result: res});
    }

    /** 玩家分数效验 **/
    async verifyDealerScores(params, session, next) {
        let res = await DBTOOLS.verifyDealerScores();
        next(null, {code: STATE_CODE.OK, result: res});
    }
	
	/** 获取所有俱乐部 **/
    async adminGetAllClubs(params, session, next) {
        let res = await DBTOOLS.adminGetAllClubs();
        next(null, {code: STATE_CODE.OK, result: res});
    }

    //俱乐部今日数据
    async adminStatistic(params, session, next){
        if(!params.cid){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let roomCount = 0;
        let userCount = 0;
        for (let key in ROOMS.roomMap) {
            if (ROOMS.roomMap[key].cid === params.cid) {
                roomCount ++;
            }
        }
        for(let key in USERS.map){
            if(USERS.map[key].cid === params.cid){
                userCount ++;
            }
        }
        let statistics = await DBTOOLS.clubStatistic(params.cid);
        next(null, {code: STATE_CODE.OK, result: {
                statistics,
                roomCount,
                userCount
            }});
    }

    //更改config文件
    async updateConfig(params, session, next) {
        if(!params.key || params.value == undefined || !params.content) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let res = await DBTOOLS.updateConfig(params.key, params.value, params.content);
        next(null, res);
    }

    //更改permission
    async changePermission(params, session, next) {
        if(!params.uid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let res = await DBTOOLS.changePermission(
            params.uid,
            params.withdraw,
            params.recharge,
            params.dismissRoom,
            params.manager,
            params.dealer,
        );
        next(null, res);
    }

    /**
     * 获取用户签名
     * @param params
     * @param session
     * @param next
     */
    getUserSign(params, session, next) {
        if(!params.uid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let sign = (utils.encodeAES(params.uid + "-" + Date.now(), config.crypto.AESKey, config.crypto.AESIv));
        next(null, {code: 200, result: {sign: sign}});
    }

    /**
     * 获取输赢玩家排序列表
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async getUserTotalScoreList(params, session, next) {
        if(isNaN(params.sortKey)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.getUserTotalScoreList(params.sortKey, params.page || 1, params.size || 6);
        next(null, {code: STATE_CODE.OK, result: res});
    }

    /**
     * 设置玩家lucky值
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async setUserLucky(params, session, next) {
        if(isNaN(params.uid) || isNaN(params.lucky)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.setUserLucky(params.uid, params.lucky);
        next(null, res);
    }

    /**
     * 设置玩家robot
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async setUserRobot(params, session, next) {
        if(isNaN(params.uid) || isNaN(params.robot)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.setUserRobot(params.uid, params.robot);
        next(null, res);
    }

    /**
     * 设置公告
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async setNoticeMsg(params, session, next) {
        if(!params.msg) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.setNoticeMsg(params.msg);
        next(null, res);
    }

    /**
     * 删除用户
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async deleteUser(params, session, next) {
        if(!params.uid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.deleteUser(params.uid);
        next(null, res);
    }

    /**
     * 恢复用户
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async reUser(params, session, next) {
        if(!params.uid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.reUser(params.uid);
        next(null, res);
    }

    /**
     * 获取profit列表
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async getUserProfitList(params, session, next) {
        let res = await DBTOOLS.getUserProfitList(params.page || 1, params.size || 6);
        next(null, {code: STATE_CODE.OK, result: res});
    }

    /**
     * 清空局数
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async resetUserInning(params, session, next) {
        let res = await DBTOOLS.resetUserInning();
        next(null, res);
    }

    /**
     * 获取写分错误log列表
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async getWriteScoreLogs(params, session, next) {
        let res = await DBTOOLS.getWriteScoreLogs(params.page || 1, params.size || 6);
        next(null, {code: STATE_CODE.OK, result: res});
    }

    /** --------------------以下需要测试-------------------- */
    /**
     * 管理员查询
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async adminQueryUser(params, session, next) {
        if (isNaN(params.uid)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let userInfo = await DBTOOLS.adminQueryUser(params.uid);
        next(null, {code: STATE_CODE.OK, result: userInfo});
    }

    /**
     * 更改用户账号
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async updateUserAccount(params, session, next) {
        if(isNaN(params.uid) || !params.account) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.updateUserAccount(params.uid, 'guest_'+params.account);
        next(null, res);
    }

    /**
     * 更改用户头像和名字
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async updateUserNameAndAvatar(params, session, next) {
        if(isNaN(params.uid)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let name = params.name || '';
        if (!!name) {
            name = name.toBase64();
        }
        let headimg = params.headimg || '';
        let res = await DBTOOLS.updateUserNameAndAvatar(params.uid, name, headimg);
        next(null, res);
    }

    /**
     * 更改用户分数变化
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async updateUserGameTurnover(params, session, next) {
        if(isNaN(params.uid) || isNaN(params.turnover)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.updateUserGameTurnover(params.uid, params.turnover);
        next(null, res);
    }

    /**
     * 更改用户局数
     * @param params
     * @param session
     * @param next
     * @returns {*}
     */
    async updateUserInning(params, session, next) {
        if(isNaN(params.uid) || isNaN(params.inning)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await DBTOOLS.updateUserInning(params.uid, params.inning);
        next(null, res);
    }
}


module.exports = function (app) {
    return hdw.handlerMiddleware(app, AdminHandler, function (params, session, next) {
        let userInfo = USERS.getUser(session.uid);
        if (!userInfo) {
            return next(null, {code: STATE_CODE.userNotExists});
        }

        /** 如果不是管理员 非常重要 不然此类里面方法可被所有人调用 */
        if (!userInfo.permission.manager) {
            return next(null, {code: STATE_CODE.notPermission});
        }

        let routes = params.__route__.split('.');
        let funName = routes[routes.length - 1];
        this.__proto__[funName].call(this, params, session, next, userInfo);
    });
};