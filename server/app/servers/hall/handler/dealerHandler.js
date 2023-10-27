/**
 *  创建者： THB
 *  日期：2020/4/16
 */
const hdw = require('../../../../common/handlerMiddleWare');

class DealerHandler{
    constructor(app) {
        this.app = app;
    }

    //代理信息
    async myInfo(params, session, next){
        let res = await DBTOOLS.dealerInfo(session.uid);
        if(res){
            next(null, {
                code: STATE_CODE.OK,
                result: res
            });
        } else {
            next(null, {code: STATE_CODE.sqlError});
        }
    }

    //代理提现记录
    async withdrawHistory(params, session, next){
        let res = await DBTOOLS.dealerWithdrawHistory(session.uid, params.page || 1, params.pagesize || 4);
        next(null, {
            code: STATE_CODE.OK,
            result: res
        });
    }

    /**
     * 下级列表
     * category 类型：0 = 直属下级； 1=从属下级；2=玩家
     * page     第几页
     */
    async subordinateList(params, session, next){
        let res = await DBTOOLS.getSubordinateList(session.uid, params.category || 0, params.page || 1, params.pagesize || 6);
        next(null, {code: STATE_CODE.OK, result: res});
    }

    //提现
    async withdraw(params, session, next, userInfo, clubInfo){
        if (!SERVER_PARAMS.withdraw) {
            return next(null, {code: STATE_CODE.withdrawStoped});
        }
        if(!params.score) return next(null, {code: STATE_CODE.lackOfParameters});
        let res = await DBTOOLS.dealerWithdraw(userInfo.cid, session.uid, params.score);

        //如果提现成功，则推送给管理员
        if(res.code === STATE_CODE.OK){
            clubInfo.sendAllAdmin("addWithdrawOrder", {
                type:'dealer',
                // id: res.insertId,
                // uid: userInfo.uid,
                // name: userInfo.name,
                // headimg: userInfo.headimg,
                // score: params.score
            })
        }

        next(null, res);
    }

    //提现为游戏积分
    async withdrawGame(params, session, next, userInfo){
        if (!SERVER_PARAMS.withdraw) {
            return next(null, {code: STATE_CODE.withdrawStoped});
        }

        if (!SERVER_PARAMS.recharge) {
            return next(null, {code: STATE_CODE.rechargeStoped});
        }

        if(!params.score) return next(null, {code: STATE_CODE.lackOfParameters});
        let res = await DBTOOLS.dealerWithdrawGame(userInfo.cid, session.uid, params.score);
        userInfo.score = res.score;
        next(null, res);
    }


}

module.exports = function (app) {
    return hdw.handlerMiddleware(app, DealerHandler, hdw.checkUid);
    // return new DealerHandler(app);
};