/**
 *  创建者： THB
 *  日期：2020/4/9
 */
const hdw = require('../../../../common/handlerMiddleWare');

class HistoryHandler{
    constructor(app) {
        this.app = app;
    }

    async history(params, session, next){

    }

    //俱乐部用户战绩
    async clubUserHistory(params, session, next){
        if (!params.gameName) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let cid = USERS.getUser(session.uid).cid;
        //如果没有指定uid则查看自己的战绩
        let uid = params.uid || session.uid;
        let page = params.page || 1;
        let pageSize = params.pageSize || 10;
        let list = await DBTOOLS.getHistoryClubUser(cid, uid, params.gameName, page, pageSize, params.startTime, params.endTime);
        next(null, {code: STATE_CODE.OK, result: list});
    }

    //俱乐部所有战绩，近三天
    async clubAllHistory(params, session, next){
        if(!params.gameName){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let cid = USERS.getUser(session.uid).cid;
        let page = params.page || 1;
        let pageSize = params.pageSize || 10;
        let list = await DBTOOLS.getHistoryAllClub(cid, params.gameName, page, pageSize, params.startTime, params.endTime);
        next(null, {code: STATE_CODE.OK, result: list});
    }
}


module.exports = function (app) {
    return hdw.handlerMiddleware(app, HistoryHandler, hdw.checkUid);
    // return new HistoryHandler(app);
};