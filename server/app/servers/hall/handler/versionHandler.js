/** * Created by apple on 2017/9/18. */const hdw = require('../../../../common/handlerMiddleWare');class VersionHandler {    constructor(app) {        this.app = app;    }    async checkVersion(params, session, next) {        let version = await DBTOOLS.getVersion(params.os, params.build, params.version);        if (version) {            version.code = STATE_CODE.OK;            version.update = true;            next(null, version);        } else {            next(null, {                code: STATE_CODE.OK,                update: false,            });        }    }}module.exports = function (app) {    // return new VersionHandler(app);    return hdw.handlerMiddleware(app, VersionHandler, hdw.checkUid);};