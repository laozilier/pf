/**
 *  创建者： THB
 *  日期：2020/4/2
 *  gate 分配服务器
 */
const utils = require('../../../../common/utils');
const config = require('../../../../config');

class GateHandler {
    constructor(app) {
        this.app = app;
    }

    /**
     * 分配登录服务器
     * @param params
     * @param session
     * @param next
     * @returns {Promise<void>}
     */
    async guestLogin(params, session, next) {
		if (!this.app.rpc.hall) {
            return next(null, {code: STATE_CODE.hallServerMiss});
        }
		
        if (params.hasOwnProperty("account")) {
            let account = "guest_" + params.account;
            //连接服务器列表
            let userInfo = await DBTOOLS.userExists(account);
            //判断是否封号
            if (userInfo && userInfo.sealUp !== 0) {
                return next(null, {code: STATE_CODE.userNotExists});
            }

            let uid = !!userInfo && userInfo.uid;
            if (!uid) {
                uid = await DBTOOLS.createUser(account, "游客", 0, "");
                if (uid <= 0) {
                    return next(null, {code: STATE_CODE.createUserFail});
                }
            }

            //分配连接服
            let connectors = this.app.getServersByType('connector');
            if (!connectors || connectors.length === 0) {
                next(null, {code: STATE_CODE.hallServerMiss});
            } else {
                let connect = connectors[Math.randomRange(0, connectors.length)];
                next(null, {
                    code: STATE_CODE.OK,
                    sign: utils.encodeAES(uid + "-" + Date.now(), config.crypto.AESKey, config.crypto.AESIv),
                    host: connect.clientHost,
                    port: connect.clientPort
                });
            }

        } else {
            next(null, {code: STATE_CODE.lackOfParameters});
        }
    }

    /**
     * 微信登录，
     * @param params
     * @param session
     * @param next
     * @returns {Promise<void>}
     */
    async wxLogin(params, session, next) {
		if (!this.app.rpc.hall) {
            return next(null, {code: STATE_CODE.hallServerMiss});
        }
		
        if (!params.code) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        let res = await utils.getWXUserInfo(config.wxLogin.appId, config.wxLogin.secret, params.code);
        if (typeof res === "number") {
            return next(null, {code: res});
        }

        let account = "wx_" + res.unionid;
        let userInfo = await DBTOOLS.userExists(account);

        //判断是否封号
        if (userInfo && userInfo.sealUp !== 0) {
            return next(null, {code: STATE_CODE.userNotExists});
        }

        //如果用户不存在，则创建用户
        let uid = !!userInfo && userInfo.uid;
        if (!uid) {
            uid = await DBTOOLS.createUser(account, res.nickname, res.sex, res.headimgurl);
            if (uid <= 0) {
                return next(null, {code: STATE_CODE.createUserFail});
            }
        }

        //选择登录服
        let connectors = this.app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            next(null, {code: STATE_CODE.hallServerMiss});
        } else {
            let connect = connectors[Math.randomRange(0, connectors.length)];
            next(null, {
                code: STATE_CODE.OK,
                sign: utils.encodeAES(uid + "-" + Date.now(), config.crypto.AESKey, config.crypto.AESIv),
                host: connect.clientHost,
                port: connect.clientPort
            });
        }
    }

    async withdrawLogin(params, session, next){
		if (!this.app.rpc.hall) {
            return next(null, {code: STATE_CODE.hallServerMiss});
        }
		
        if(!params.uid){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        //连接服务器列表
        let userInfo = await DBTOOLS.userExistsByUid(params.uid);
        let permission = await DBTOOLS.userPermission(params.uid);
        //判断权限
        if(!permission || permission.withdraw == 0){
            return next(null, {code: STATE_CODE.notPermission});
        }
        //判断是否封号
        if (userInfo && userInfo.sealUp !== 0) {
            return next(null, {code: STATE_CODE.userNotExists});
        }

        //分配连接服
        let connectors = this.app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            next(null, {code: STATE_CODE.hallServerMiss});
        } else {
            let connect = connectors[Math.randomRange(0, connectors.length)];
            next(null, {
                code: STATE_CODE.OK,
                sign: utils.encodeAES(params.uid + "-" + Date.now(), config.crypto.AESKey, config.crypto.AESIv),
                host: connect.clientHost,
                port: connect.clientPort
            });
        }
    }

    async managerLogin(params, session, next){
		if (!this.app.rpc.hall) {
            return next(null, {code: STATE_CODE.hallServerMiss});
        }
		
        if(!params.uid){
            return next(null, {code: STATE_CODE.lackOfParameters});
        }

        //连接服务器列表
        let userInfo = await DBTOOLS.userExistsByUid(params.uid);
        let permission = await DBTOOLS.userPermission(params.uid);
        //判断权限
        if(!permission || permission.manager == 0){
            return next(null, {code: STATE_CODE.notPermission});
        }
        //判断是否封号
        if (userInfo && userInfo.sealUp !== 0) {
            return next(null, {code: STATE_CODE.userNotExists});
        }

        //分配连接服
        let connectors = this.app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            next(null, {code: STATE_CODE.hallServerMiss});
        } else {
            let connect = connectors[Math.randomRange(0, connectors.length)];
            next(null, {
                code: STATE_CODE.OK,
                sign: utils.encodeAES(params.uid + "-" + Date.now(), config.crypto.AESKey, config.crypto.AESIv),
                host: connect.clientHost,
                port: connect.clientPort
            });
        }
    }

    //用户快速登录
    async quickLogin(params, session, next){
		if (!this.app.rpc.hall) {
            return next(null, {code: STATE_CODE.hallServerMiss});
        }
		
        let signString = "";
        try {
            //解析sign
            signString = utils.decodeAES(params.sign, config.crypto.AESKey, config.crypto.AESIv)
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

        //分配连接服
        let connectors = this.app.getServersByType('connector');
        if (!connectors || connectors.length === 0) {
            next(null, {code: STATE_CODE.hallServerMiss});
        } else {
            let connect = connectors[Math.randomRange(0, connectors.length)];
            next(null, {
                code: STATE_CODE.OK,
                sign: params.sign,
                host: connect.clientHost,
                port: connect.clientPort
            });
        }
    }
}

module.exports = function (app) {
    return new GateHandler(app);
};