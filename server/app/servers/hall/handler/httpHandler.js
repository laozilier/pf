/**
 * Created by apple on 2020/06/08.
 * 请求http接口
 */


const hdw = require('../../../../common/handlerMiddleWare');
const $ = require('../../../../common/ajax');

class HttpHandler {
    constructor(app) {
        this.app = app;
    }


    async interface(params, session, next, userInfo, clubInfo) {
        if (!params.path) {
            return next(null, {code: STATE_CODE.lackOfParameters});
        }
        //pay/joycenter/index.php
        if (!params.data) {
            params.data = {};
        }
        params.data.uid = session.uid;
        let res = await $.get("http://hot.zsdhgl.com/" + params.path, params.data)
            .catch(err => {
                APP_LOG.error(err);
            });
        if (res) {
            res = res.toString();
        }

        next(null, {code: STATE_CODE.OK, result: res});
    }
}

module.exports = function (app) {
    return hdw.handlerMiddleware(app, HttpHandler, hdw.checkUid);
};