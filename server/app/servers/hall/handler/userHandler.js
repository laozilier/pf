/**
 *  创建者： THB
 *  日期：2020/4/8
 */
const utils = require('../../../../common/utils');
const config = require('../../../../config');
const $ = require('../../../../common/ajax');
const hdw = require('../../../../common/handlerMiddleWare');
class HallHandler {
    constructor(app) {
        this.app = app;
    }

    /**
     * 更新玩家的位置信息
     * params.location 玩家位置
     */
    async updateLocation(params, session, next) {
        let location = params.location;
        if (!location) {
            next(null, {code: STATE_CODE.lackOfParameters});
        }

        let userInfo = USERS.getUser(session.uid);
        let result = await DBTOOLS.updateLocation(session.uid, JSON.stringify(params.location));
        if (userInfo && result) {
            userInfo.location = params.location;
        }
        next(null, {code: STATE_CODE.OK, result: !!result});
    }

    //更新备注
    async updateRemarks(params, session, next) {
        if (params.remarks === undefined) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        if (params.remarks.length > 255) {
            params.remarks = params.remarks.substring(0, 255);
        }
        let userInfo = USERS.getUser(session.uid);
        let res = await DBTOOLS.updateRemark(session.uid, params.remarks);
        if (userInfo && res) {
            userInfo.remarks = params.remarks;
        }
        next(null, {code: STATE_CODE.OK, result: !!res});
    }

    //搜索用户
    async searchUser(params, session, next) {
        if (!params.uid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let userInfo = await DBTOOLS.getSearchUser(params.uid);
        next(null, {code: STATE_CODE.OK, result: userInfo});
    }

    //绑定上级
    async bindParent(params, session, next) {
        if (!params.pid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let code = await DBTOOLS.bindParent(session.uid, params.pid);
        let userInfo = USERS.getUser(session.uid);
        if (userInfo && code === STATE_CODE.OK) {
            await userInfo.update();
        }
        next(null, {
            code: code,
            result: {
                cid: userInfo.cid
            }
        });
    }

    //充值记录
    async rechargeHistory(params, session, next) {
        let res = await DBTOOLS.rechargeHistory(session.uid);
        next(null, {
            code: !!res ? STATE_CODE.OK : STATE_CODE.sqlError,
            result: res
        });
    }

    //提现记录
    async playerWithdrawHistory(params, session, next) {
        let res = await DBTOOLS.playerWithdrawHistory(session.uid);
        next(null, {
            code: !!res ? STATE_CODE.OK : STATE_CODE.sqlError,
            result: res
        });
    }

    //获取绑定信息
    async getBindInfo(params, session, next) {
        let userInfo = USERS.getUser(session.uid);
        if (userInfo) {
            next(null, {
                code: STATE_CODE.OK,
                result: {
                    mobile: userInfo.mobile,
                    paymenturl: userInfo.paymentUrl,
                    nickname: userInfo.wxNickname,
                    realname: userInfo.wxRealname,
                    headimg: userInfo.wxHeadimg
                }
            });
        } else {
            let res = await DBTOOLS.getBindInfo(session.uid);
            next(null, {
                code: STATE_CODE.OK,
                result: res
            });
        }
    }

    //绑定提现微信
    async bindWithdrawWechat(params, session, next) {
        let domain = await DBTOOLS.getWithdrawDomain();
        if (domain) {
            let code = utils.encodeAES(session.uid + "-" + Date.now(), config.crypto.key, config.crypto.iv);
            next(null, {
                code: STATE_CODE.OK,
                result: domain + "?id=" + code.toHex()
            });
        } else {
            next(null, {code: STATE_CODE.OK});
        }
    }

    //保存收款码
    async savePaymentCode(params, session, next, userInfo) {
        if (!params.paymentUrl || !params.name) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let paymentName = params.name.toBase64();
        let res = await DBTOOLS.savePaymenturl(session.uid, params.paymentUrl, paymentName);
        if (res) {
            //内存中同步改
            if (res.code === STATE_CODE.OK) {
                userInfo.paymentUrl = params.paymentUrl;
                userInfo.paymentName = paymentName;
            }
            next(null, {code: res.code});
        } else {
            next(null, {code: STATE_CODE.sqlError});
        }
    }

    //发送验证码
    async sendCaptcha(params, session, next) {
        let mobile = params.mobile;
        if (!mobile) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let res = await utils.getCaptcha(mobile);
        next(null, res);
    }

    //绑定手机
    async bindMobile(params, session, next) {
        if (!params.mobile || !params.captcha) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        let captcha = params.captcha;
        let obj = MOBILES[params.mobile];
        if (!obj) {
            return next(null, {code: STATE_CODE.captchError});
        }

        /** 判断验证码是否一致 **/
        if (obj.captcha != captcha) {
            return next(null, {code: STATE_CODE.captchError});
        }

        /** 判断验证码是否被使用 **/
        if (obj.used) {
            return next(null, {code: STATE_CODE.captchUsed});
        }

        /** 判断是否过期 **/
        let date = obj.date;
        let now = Date.now();
        if (now-date > 60*60*1000) {
            return next(null, {code: STATE_CODE.captchExpired});
        }

        let res = await DBTOOLS.saveMobile(session.uid, params.mobile);
        if (res) {
            obj.used = true;
            let userInfo = USERS.getUser(session.uid);
            userInfo.mobile = params.mobile;
            next(null, res);
        } else {
            next(null, {
                code: STATE_CODE.sqlError
            });
        }
    }

    //调整玩家返佣比例
    async setProfitRatio(params, session, next, userInfo, clubInfo) {
        if (!params.ratio && !params.uid && !params.cid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        if (clubInfo.admins[session.uid] > 0 || userInfo.permission.dealer) {
            let res = await DBTOOLS.setProfit(params.cid, session.uid, params.uid, params.ratio);
            if (res && res.code === STATE_CODE.OK) {
                let userInfo = USERS.getUser(params.uid);
                if (userInfo) {
                    userInfo.profitRatio = res.ratio;
                    userInfo.sendChangeProfit(this.app);
                }
            }
            next(null, res);
        } else {
            next(null, {code: STATE_CODE.notAdmin});
        }
    }

    //查看自己的赠送记录
    async giveHistory(params, session, next) {
        if (!session.uid) return next(null, {code: STATE_CODE.sessionNotExists});
        let res = await DBTOOLS.clubGiveScoreHistory(session.uid, params.page || 1, params.pagesize || 6);
        next(null, {
            code: !!res ? STATE_CODE.OK : STATE_CODE.sqlError,
            result: res
        });
    }

    //封禁账号
    async sealUpAccount(params, session, next, userInfo, clubInfo) {
        if (!params.uid) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        if (clubInfo.admins[session.uid] > 0) {
            let res = await DBTOOLS.sealUpAccount(params.uid);
            if (res.sealUp === 1) {
                let userInfo = USERS.getUser(params.uid);
                if (userInfo) {
                    userInfo.sealUp = true;
                }
                let room = ROOMS.getRoomByUid(params.uid);
                if (room) {
                    this.app.rpc.room.gameRemote.kickPlayer(room.serverId, room.rid, params.uid, (err, res) => {
                    });
                }
            }
            next(null, res);
        } else {
            next(null, {code: STATE_CODE.notAdmin});
        }
    }

    //客户端用来同步用户数据，暂时只有分数
    async syncInfo(params, session, next, userInfo, clubInfo){
        await userInfo.update();
        next(null, {
            code: STATE_CODE.OK,
            result:{
                score: userInfo.score
            }
        });
    }
}


module.exports = function (app) {
    // return new HallHandler(app);
    return hdw.handlerMiddleware(app, HallHandler, hdw.checkUid);
};