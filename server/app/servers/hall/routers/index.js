/**
 *  创建者： THB
 *  日期：2020/5/25
 */
let router = require("koa-router")();
const config = require("../../../../config");
const utils = require("../../../../common/utils");
const msgsender = require("../../../../common/msgsender.js");

router.get("/", async (ctx, next) => {
    ctx.body = "OK";
});

//微信绑定
router.get("/WeChatBind", async (ctx, next) => {
    let code = ctx.query.code;
    let inviteCode = ctx.query.inviteCode;
    if (!code || isNaN(parseInt(inviteCode))) {
        ctx.body = { code: STATE_CODE.lackOfParameters, msg: "缺少参数" };
        return;
    }

    let res = await utils.getWXUserInfo(config.WebWXLogin.appId, config.WebWXLogin.secret, code);
    if (typeof res === "number") {
        ctx.body = { code: res, msg: "请求用户信息失败" };
        return;
    }

    let account = "wx_" + res.unionid;
    let userInfo = await DBTOOLS.userExists(account);

    //判断是否封号
    if (userInfo && userInfo.sealUp !== 0) {
        ctx.body = { code: STATE_CODE.userNotExists, msg: "用户被封号" };
        return;
    }

    //如果用户不存在，则创建用户
    let uid = !!userInfo && userInfo.uid;
    if (!uid) {
        uid = await DBTOOLS.createUser(account, res.nickname, res.sex, res.headimgurl);
        if (uid <= 0) {
            ctx.body = { code: STATE_CODE.userNotExists, msg: "创建用户失败，请联系上级代理" };
            return;
        }
    }

    let stateCode = STATE_CODE.OK;
    if (inviteCode) {
        //绑定上级
        stateCode = await DBTOOLS.bindParent(uid, inviteCode);
    }
    ctx.body = { code: stateCode };
});

//单个俱乐部
router.get("/clubInfo", async (ctx, next) => {
    let uid = ctx.query.uid;
    if (isNaN(uid)) {
        return (ctx.body = { code: STATE_CODE.lackOfParameters });
    }

    let cid = ctx.query.cid;
    if (isNaN(cid)) {
        return (ctx.body = { code: STATE_CODE.lackOfParameters });
    }

    let clubInfo = CLUBS.getClub(null, cid);
    let result = clubInfo.info(uid);
    //*********** 俱乐部包间规则 ****************//
    result.privateRooms = await clubInfo.getPrivateRooms();
    //*********** 俱乐部桌子列表 ****************//
    result.tables = [];
    for (let key in ROOMS.roomMap) {
        if (ROOMS.roomMap[key].cid == cid) {
            let room = ROOMS.roomMap[key];
            result.tables.push({
                rid: room.rid,
                prid: room.prid,
                seats: room.seats,
            });
        }
    }

    ctx.body = { code: STATE_CODE.OK, result: result };
});

//充值成功，通知客户端
router.get("/rechargeSuccess", async (ctx, next) => {
    let uid = ctx.query.uid;
    let score = ctx.query.score;
    let userInfo = USERS.getUser(uid);
    if (userInfo) {
        userInfo.score += parseInt(score);
        userInfo.sendChangeScore(ctx.pomeloApp, score);
    }
    ctx.body = "推送成功";
});

//版本强制更新
router.get("/checkVersion", async (ctx, next) => {
    let version = await DBTOOLS.getVersion(ctx.query.os, ctx.query.build, ctx.query.version);
    ctx.body = { code: STATE_CODE.OK, result: version };
});

//获得验证码
router.get("/getVerifyCode", async (ctx, next) => {
    let mobile = ctx.query.mobile;
    let obj = MOBILES[mobile];
    if (!obj || obj.nextTime > Date.now()) {
        let res = await msgsender.Send(mobile);
        ctx.body = res;
    } else {
        ctx.body = { code: STATE_CODE.OK };
    }
});

//获得验证码
router.get("/mobileLogin", async (ctx, next) => {
    let mobile = ctx.query.mobile;
    if (!msgsender.IsMobile(mobile)) return (ctx.body = { code: STATE_CODE.mobileError });
    let obj = MOBILES[mobile];
    if (!obj) return (ctx.body = { code: STATE_CODE.captchError });
    let code = obj.code;
    if (code != ctx.query.code) return (ctx.body = { code: STATE_CODE.captchError });
    if (obj.expireTime < Date.now()) return (ctx.body = { code: STATE_CODE.captchExpired });
    let account = "mobile_" + mobile;
    let userInfo = await DBTOOLS.userExists(account);

    //判断是否封号
    if (userInfo && userInfo.sealUp !== 0) {
        return (ctx.body = { code: STATE_CODE.userNotExists });
    }

    //如果用户不存在，则创建用户
    let uid = !!userInfo && userInfo.uid;
    if (!uid) {
        uid = await DBTOOLS.createUser("mobile_" + mobile, "用户" + mobile.slice(-4), 0, "");
        if (uid <= 0) return (ctx.body = { code: STATE_CODE.createUserFail });
    }

    if (!!ctx.query.inviteCode) {
        await DBTOOLS.bindParent(uid, ctx.query.inviteCode);
    }

    delete MOBILES[mobile];

    let sign = utils.encodeAES(uid + "-" + Date.now(), config.crypto.AESKey, config.crypto.AESIv);
    ctx.body = { code: STATE_CODE.OK, result: { sign } };
});

module.exports = router;
