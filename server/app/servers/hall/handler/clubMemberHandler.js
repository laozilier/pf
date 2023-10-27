/**
 *  创建者： THB
 *  日期：2020/5/15
 *  俱乐部成员的操作
 */
const hdw = require('../../../../common/handlerMiddleWare');

class ClubMemberHandler{
    constructor(app) {
        this.app = app;
    }

    //用户详情
    async detailUserInfo(params, session, next, userInfo, clubInfo){
        if(!params.uid){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let res = await DBTOOLS.detailUserInfo(userInfo.cid, session.uid, params.uid);
        next(null, {
            code: STATE_CODE.OK,
            result: res
        });
    }

    //赠送积分
    async giveScore(params, session, next, userInfo, clubInfo){
        if (!SERVER_PARAMS.giveScore) {
            return next(null, {code: STATE_CODE.giveScoreStoped});
        }

        if(!params.uid || !params.score){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        if (!!GIVEUIDS[session.uid]) {
            return next(null, {code: STATE_CODE.giveScoreTooQuick});
        }

        //自己在游戏中不能赠送
        if(ROOMS.getRoomByUid(session.uid)) return next(null, {code: STATE_CODE.selfInTheGame});
        //对方在游戏中也不能赠送
        if(ROOMS.getRoomByUid(params.uid)) return next(null, {code: STATE_CODE.otherInTheGame});

        GIVEUIDS[session.uid] = true;

        let res = await DBTOOLS.giveScore(session.uid, params.uid, params.score, userInfo.cid);
        if(res.code === STATE_CODE.OK){
            let userInfo2 = USERS.getUser(params.uid);
            userInfo.score -= params.score;
            if(userInfo2){
                userInfo2.score += params.score;
                userInfo2.sendChangeScore(this.app, params.score);
            }
        }

        setTimeout(()=> {
            delete GIVEUIDS[session.uid];
        }, 60000);

        next(null, res);
    }

    //给用户增加积分
    async addScore(params, session, next, userInfo, clubInfo){
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

        if(clubInfo.admins[session.uid] > 0){
            let res = await DBTOOLS.addScore(params.uid, session.uid, params.score, userInfo.cid);
            if(res.code === STATE_CODE.OK){
                let userInfo2 = USERS.getUser(params.uid);
                if(userInfo2){
                    userInfo2.score += params.score;
                    userInfo2.sendChangeScore(this.app, params.score);
                }
            }
            next(null, res);
        } else {
            next(null, {code: STATE_CODE.notAdmin});
        }
    }

    //给用户减少积分
    async decreaseScore(params, session, next, userInfo, clubInfo){
        // if (!SERVER_PARAMS.giveScore) {
        //     return next(null, {code: STATE_CODE.giveScoreStoped});
        // }
        //
        // if(!params.uid || !params.score){
        //     return next(null, {code: STATE_CODE.lackOfParameters});
        // }
        // //自己在游戏中不能赠送
        // if(ROOMS.getRoomByUid(session.uid)) return next(null, {code: STATE_CODE.selfInTheGame});
        // //对方在游戏中也不能赠送
        // if(ROOMS.getRoomByUid(params.uid)) return next(null, {code: STATE_CODE.otherInTheGame});
        //
        // let res = await DBTOOLS.giveScore(params.uid, session.uid, params.score, userInfo.cid);
        // if(res.code === STATE_CODE.OK) {
        //     let userInfo2 = USERS.getUser(params.uid);
        //     userInfo.score += params.score;
        //     if(userInfo2){
        //         userInfo2.score -= params.score;
        //         userInfo2.sendChangeScore(this.app, -params.score);
        //     }
        // }
        // next(null, res);

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
        if(clubInfo.admins[session.uid] > 0){
            let res = await DBTOOLS.decreaseScore(params.uid, session.uid, params.score, userInfo.cid);
            if(res.code === STATE_CODE.OK){
                let userInfo2 = USERS.getUser(params.uid);
                if(userInfo2){
                    userInfo2.score -= params.score;
                    userInfo2.sendChangeScore(this.app, -params.score);
                }
            }
            next(null, res);
        } else {
            next(null, {code: STATE_CODE.notAdmin});
        }
    }

    //充值记录
    async rechargeHistory(params, session, next, userInfo, clubInfo) {
        if(!params.uid)
            return next(null, {code: STATE_CODE.lackOfParameters});

        let res = await DBTOOLS.clubRechargeHistory(userInfo.cid, session.uid, params.uid, params.page || 1, params.pagesize || 6);
        next(null, {
            code: !!res ? STATE_CODE.OK : STATE_CODE.sqlError,
            result: res
        });
    }

    //提现记录
    async withdrawHistory(params, session, next, userInfo, clubInfo) {
        if(!params.uid)
            return next(null, {code: STATE_CODE.lackOfParameters});

        let res = await DBTOOLS.clubWithdrawHistory(userInfo.cid, session.uid, params.uid, params.page || 1, params.pagesize || 6);
        next(null, {
            code: !!res ? STATE_CODE.OK : STATE_CODE.sqlError,
            result: res
        });
    }

    //赠送记录
    async giveScoreHistory(params, session, next, userInfo, clubInfo) {
        if(!params.uid)
            return next(null, {code: STATE_CODE.lackOfParameters});
        if(clubInfo.admins[session.uid] > 0){
            let res = await DBTOOLS.clubGiveScoreHistory(params.uid, params.page || 1, params.pagesize || 6);
            next(null, {
                code: !!res ? STATE_CODE.OK : STATE_CODE.sqlError,
                result: res
            });
        } else {
            next(null, {
                code: STATE_CODE.notAdmin
            });
        }
    }

    //管理员保存收款码
    async managerSavePaymentCode(params, session, next, userInfo, clubInfo) {
        if (!params.paymentUrl || isNaN(params.uid) || !params.name) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let paymentName = params.name.toBase64();
        let res = await DBTOOLS.managerSavePaymenturl(userInfo.cid, session.uid, params.uid, params.paymentUrl, paymentName);
        if (res) {
            //内存中同步改
            if (res.code === STATE_CODE.OK) {
                let userInfo2 = USERS.getUser(params.uid);
                if (!!userInfo2) {
                    userInfo2.paymentUrl = params.paymentUrl;
                    userInfo2.paymentName = paymentName;
                }
            }
            next(null, {code: res.code});
        } else {
            next(null, {code: STATE_CODE.sqlError});
        }
    }
}

module.exports = function (app) {
    return hdw.handlerMiddleware(app, ClubMemberHandler, hdw.clubMiddleWare);
};
