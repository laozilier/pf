/**
 *  创建者： THB
 *  日期：2020/4/9
 */
const config = require('../../../../config');
const utils = require('../../../../common/utils');
const hdw = require('../../../../common/handlerMiddleWare');
const $ = require('../../../../common/ajax');

class WithdrawHandler{
    constructor(app) {
        this.app = app;
    }

    async withdrawScore(params, session, next, userInfo, clubInfo){
        if (!SERVER_PARAMS.withdraw) {
            return next(null, {code: STATE_CODE.withdrawStoped});
        }

        if (isNaN(params.score)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        //判断是否在房间中
        if(ROOMS.getRoomByUid(session.uid)){
            return next(null, {code: STATE_CODE.playingGame});
        }

        //开始提现
        let result = await DBTOOLS.withdraw(userInfo.cid, session.uid, params.score);
        if(result.code === STATE_CODE.OK){
            let userInfo = USERS.getUser(session.uid);
            if(userInfo)
                userInfo.score = result.score;
			/**
            if(result.insertId){
                result.secret = utils.encodeAES(result.insertId, config.crypto.key, config.crypto.iv);
            }
			*/
            //如果提现成功，则推送给管理员
            if(result.code === STATE_CODE.OK){
                clubInfo.sendAll("addWithdrawOrder", {
                    type:'user',
                    // id: result.insertId,
                    // uid: userInfo.uid,
                    // name: userInfo.name,
                    // headimg: userInfo.headimg,
                    // score: params.score
                })
            }
            //提现订单处理
            next(null, {
                code: result.code,
                //secret: result.secret,
                score: result.score,
                msg: result.msg
            });
        } else {
            next(null, result);
        }
    }

    //玩家下分列表
    async playerWithdrawList(params, session, next, userInfo, clubInfo) {
        if (isNaN(params.status)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let array = await DBTOOLS.playerWithdrawList(userInfo.cid, session.uid, params.status, params.searchUid || 0, params.page || 1, params.pagesize || 10);
        next(null, {code: STATE_CODE.OK, result: array});
    }

    //代理下分列表
    async dealerWithdrawList(params, session, next, userInfo, clubInfo) {
        if (isNaN(params.status)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let array = await DBTOOLS.dealerWithdrawList(userInfo.cid, session.uid, params.status, params.searchUid || 0, params.page || 1, params.pagesize || 10);
        next(null, {code: STATE_CODE.OK, result: array});
    }

    //同意玩家下分到微信零钱
    async playerAgreePayToWx(params, session, next, userInfo, clubInfo) {
        if (isNaN(params.order_id) || !params.openid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        // let res = await DBTOOLS.playerAlreadyWithdraw(session.uid, params.order_sn, 1, 'payment_no', 'partner_trade_no');
        let res = await $.get("http://hot.zsdhgl.com/payout/game.php", {orderId: params.order_id, openid:params.openid})
            .catch(err => {
                APP_LOG.error(err);
            });
        if (res) {
            res = res.toString();
        }
        next(null, res);
    }

    //已经处理玩家下分
    async playerAlreadyWithdraw(params, session, next, userInfo, clubInfo) {
        if (!params.order_sn || isNaN(params.status)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let res = await DBTOOLS.playerAlreadyWithdraw(session.uid, params.order_sn, params.status, '', '');
        next(null, res);
    }

    //同意代理下分到微信零钱
    async dealerAgreePayToWx(params, session, next, userInfo, clubInfo) {
        if (isNaN(params.order_id) || !params.openid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        // let res = await DBTOOLS.dealerAlreadyWithdraw(session.uid, params.order_sn, 1, 'payment_no', 'partner_trade_no');
        let res = await $.get("http://hot.zsdhgl.com/payout/dealer.php", {orderId: params.order_id, openid:params.openid})
            .catch(err => {
                APP_LOG.error(err);
            });
        if (res) {
            res = res.toString();
        }
        next(null, res);
    }

    //已经处理玩家下分
    async dealerAlreadyWithdraw(params, session, next, userInfo, clubInfo) {
        if (!params.order_sn || isNaN(params.status)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let res = await DBTOOLS.dealerAlreadyWithdraw(session.uid, params.order_sn, params.status, '', '');
        next(null, res);
    }

    async withdrawInfo(params, session, next) {
        if (isNaN(params.uid)) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let res = await DBTOOLS.withdrawInfo(params.uid);
        if (res.code == STATE_CODE.OK) {
            next(null, {code: STATE_CODE.OK, result: res});
        } else {
            next(null, res);
        }
    }

    async withdrawNum(params, session, next, userInfo) {
        let res = await DBTOOLS.withdrawNum(userInfo.cid, session.uid);
        if (res.code == STATE_CODE.OK) {
            next(null, {code: STATE_CODE.OK, result: res});
        } else {
            next(null, res);
        }
    }
}


module.exports = function (app) {
    // return new WithdrawHandler(app);
    return hdw.handlerMiddleware(app, WithdrawHandler, hdw.checkUid);
};