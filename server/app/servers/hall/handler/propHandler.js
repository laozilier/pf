/**
 *  创建者： THB
 *  日期：2020/4/15
 *  道具
 */
const hdw = require('../../../../common/handlerMiddleWare');

class PropHandler{
    constructor(app) {
        this.app = app;
    }

    async rechargeProp(params, session, next){
        if (!SERVER_PARAMS.recharge) {
            return next(null, {code: STATE_CODE.rechargeStoped});
        }

        let res = await DBTOOLS.getPropList();
        next(null, {code: STATE_CODE.OK, result: res});
    }

}


module.exports = function (app) {
    // return new PropHandler(app);
    return hdw.handlerMiddleware(app, PropHandler, hdw.checkUid);
};