/**
 *  创建者： THB
 *  日期：2020/05/23
 *  应用程序工具类
 */


/**
 * handler子类，如果在处理handler中接口前需要统一执行方法可以使用此中间件
 * @param app         框架上下文
 * @param handler     定义的handler
 * @param subFunction 功能函数
 */
exports.handlerMiddleware = function (app, handler, subFunction) {
    class HandlerMiddleWare extends handler{
        constructor(app) {
            super(app);
            let keys = Object.getOwnPropertyNames(handler.prototype);
            keys.forEach(name => {
                if (name !== 'constructor') {
                    this[name] = subFunction;
                }
            });
        }
    }
    return new HandlerMiddleWare(app);
};

/**
 * 验证session是否绑定uid
 * @param params
 * @param session
 * @param next
 */
exports.checkUid = function(params, session, next){
    if (!session.uid) {
        next(null, {code: STATE_CODE.loginTimeout});
    } else {
        let userInfo = USERS.getUser(session.uid);
        let clubInfo = CLUBS.getClub(this.app, userInfo.cid);
        let routes = params.__route__.split('.');
        let funName = routes[routes.length - 1];
        this.__proto__[funName].call(this, params, session, next, userInfo, clubInfo);
    }
};

/**
 *  俱乐部接口的中间件，判断俱乐部是否存在
 */
exports.clubMiddleWare = function (params, session, next) {
    let userInfo = USERS.getUser(session.uid);
    let clubInfo = CLUBS.getClub(this.app, userInfo.cid);
    if (!userInfo) {
        return next(null, {code: STATE_CODE.userNotExists});
    }
    if(!clubInfo)
        return next(null, {code: STATE_CODE.clubNotExist});

    let routes = params.__route__.split('.');
    let funName = routes[routes.length - 1];
    this.__proto__[funName].call(this, params, session, next, userInfo, clubInfo);
};