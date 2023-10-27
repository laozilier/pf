/**
 *  创建者： THB
 *  日期：2020/4/2
 *  gate 分配服务器
 */
const utils = require('../../../../common/utils');
const config = require('../../../../config');

class EntryHandler {
    constructor(app) {
        this.app = app;
    }

    async entry(msg, session, next) {
		if (!this.app || !this.app.rpc || !this.app.rpc.hall) {
            return next(null, {code: STATE_CODE.hallServerMiss});
        }
		
        let signString = "";
        try {
            //解析sign
            signString = utils.decodeAES(msg.sign, config.crypto.AESKey, config.crypto.AESIv)
        } catch (e) {
            APP_LOG.warn("密钥无法解析");
            APP_LOG.warn(e);
        }
        if (signString.length === 0) {
            return next(null, {code: STATE_CODE.signError});
        }

        //判断sign结构是否正确
        let signs = signString.split('-');
        if (signs.length !== 2) {
            return next(null, {code: STATE_CODE.signError});
        }

        let uid = parseInt(signs[0]);
        let now = parseInt(signs[1]);
        //判断uid是否合法
        if (isNaN(uid)) {
            return next(null, {code: STATE_CODE.signError});
        }
        //密钥7天有效期
        if (Date.now() - now > 1000 * 60 * 60 * 24 * 7) {
            return next(null, {code: STATE_CODE.signError});
        }

        //连接服务器列表
        let userInfo = await DBTOOLS.userExistsByUid(uid);
        //判断是否封号,账号是否存在
        if (userInfo && userInfo.sealUp !== 0) {
            return next(null, {code: STATE_CODE.userNotExists});
        }

        let sessionService = this.app.get('sessionService');
        APP_LOG.log(`${uid}玩家上线`);
        //判断重复登录
        if (!!sessionService.getByUid(uid)) {
            next(null, {code: STATE_CODE.duplicateLogin});
        } else {
            //绑定登录用户
            session.bind(uid);
            session.on('closed', onUserLeave.bind(null, this.app));
            let ip = session.__session__.__socket__.remoteAddress.ip.replace("::ffff:", "");
            this.app.rpc.hall.hallRemote.login(0, uid, session.frontendId, ip, (code, userinfo) => {
                if (!userinfo)
                    return next(null, {code: STATE_CODE.userNotExists});

                if (userinfo.roomInfo) {
                    session.set('rid', userinfo.roomInfo.rid);
                    session.push('rid', (err) => {
                        if (err) {
                            APP_LOG.error('设置房间号到session service 失败! 错误 : %j', err.stack);
                        }
                        next(null, {code: STATE_CODE.OK, result: userinfo});
                    });
                } else {
                    next(null, {code: STATE_CODE.OK, result: userinfo});
                }
            });
        }
    }
}

//断线后执行
function onUserLeave(app, session) {
    if (!session || !session.uid) {
        return;
    }
    APP_LOG.log(`玩家${session.uid}离线`);
    let uid = session.uid;
    let rid = session.get('rid') || 0;
    if (uid) {
        app.rpc.hall.hallRemote.userLeave(0, uid, rid, (err, result) => {
            if (err) {
                APP_LOG.error(err);
                APP_LOG.log("通知大厅层失败");
            }
        });
    }
}

module.exports = function (app) {
    return new EntryHandler(app);
};