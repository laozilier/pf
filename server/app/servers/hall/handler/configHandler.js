/**
 *  创建者： THB
 *  日期：2020/5/18
 */

class ConfigHandler{
    constructor(app) {
        this.app = app;
    }

    async ratios(params, session, next){
        let content = await DBTOOLS.getRatios();
        next(null, {code: STATE_CODE.OK, result: content});
    }

    async inviteUrl(params, session, next){
        let url = await DBTOOLS.getInviteUrl();
        //next(null, {code: STATE_CODE.OK, result: `${url}/bind${Date.now()}?inviteCode=${session.uid}`});
        next(null, {code: STATE_CODE.OK, result: `${url}?inviteCode=${session.uid}`});
    }

    async getKefuUrl(params, session, next){
        let url = await DBTOOLS.getKefuUrl();
        next(null, {code: STATE_CODE.OK, result: `${url}`});
    }
}

module.exports = function (app) {
    return new ConfigHandler(app);
};




