/**
 *  创建者： THB
 *  日期：2019/12/18
 *  工具类
 */

const crypto = require('crypto');
const parseXML = require('xml2js').parseString;
const $ = require('./ajax');

/**
 * 编码md5
 * @param content
 * @returns {string}
 */
exports.md5 = function (content) {
    content = content == null ? "" : content;
    let md5 = crypto.createHash('md5');
    md5.update(content);
    return md5.digest('hex');
};

/**
 * 编码AES
 * @param data  要编码的数据
 * @param key   编码key
 * @param iv    编码iv
 * @returns {string}  编码后的数据
 */
exports.encodeAES = function (data, key, iv) {
    let cipherChunks = [];
    let cipher = crypto.createCipheriv('aes-128-cbc', key, iv);
    cipher.setAutoPadding(true);
    cipherChunks.push(cipher.update(data + "", 'utf8', 'base64'));
    cipherChunks.push(cipher.final('base64'));
    return cipherChunks.join('');
};

/**
 * 解码AES
 * @param data  密文
 * @param key   key
 * @param iv    iv
 * @returns {string}  解码后的数据
 */
exports.decodeAES = function (data, key, iv){
    data = new Buffer(data, 'base64').toString('binary');
    let decipher = crypto.createDecipheriv('aes-128-cbc', key, iv);
    let decoded = decipher.update(data, 'binary', 'utf8');
    decoded += decipher.final('utf8');
    return decoded;
};

/**
 * xml 转 json对象
 * @param xml
 * @returns {Promise<any>}  返回Json对象
 */
exports.xmlToJson = function (xml) {
    return new Promise((resolve, reject) => {
        if (!xml)
            resolve(null);
        else {
            parseXML(xml, (err, result) => {
                if (err) console.error(err);
                resolve(result);
            });
        }
    });
};

/**
 * 深度拷贝对象
 * @param obj
 * @returns {Object}
 */
exports.deepCopy = function (obj){
    if(typeof obj != 'object'){
        return obj;
    }
    let newobj = {};
    for ( let attr in obj) {
        newobj[attr] = this.deepCopy(obj[attr]);
    }
    return newobj;
};

/**
 * 获取微信用户信息
 * @param appID     appid
 * @param appSecret secret
 * @param loginCode code
 * @returns {Promise<number>}
 */
exports.getWXUserInfo = async function (appID, appSecret, loginCode) {
    //微信登录token
    let tokenInfo = await $.get("https://api.weixin.qq.com/sns/oauth2/access_token", {
        appid: appID,
        secret: appSecret,
        code: loginCode,
        grant_type: 'authorization_code'
    });
	
    tokenInfo = JSON.parse(tokenInfo.toString());
	console.log('tokenInfo = ', tokenInfo);
    //判断是否拿到token
    if (!tokenInfo || tokenInfo.errcode) {
        APP_LOG.error(tokenInfo);
        return STATE_CODE.获取微信Token失败;
    }

    let userInfo = await $.get("https://api.weixin.qq.com/sns/userinfo", {
        access_token: tokenInfo.access_token,
        openid: tokenInfo.openid
    });
	
	userInfo = JSON.parse(userInfo.toString());
	console.log('userInfo = ', userInfo);
    if (!userInfo || userInfo.errcode) {
        APP_LOG.error(userInfo);
        return STATE_CODE.获取微信账户信息失败;
    }
	
	return userInfo;
};

/**
 * 获取验证码
 * @param mobile
 * @returns {Promise<*>}
 */
exports.getCaptcha = async function (mobile) {
    /** 检查手机号 **/
    if (!mobile) {
        return {code: STATE_CODE.mobileError};
    }

    /** 如果此手机已经有验证码
     * obj结构为
     * date: 时间(最后一条验证码的时间),
     * captcha: 验证码,
     * used: 是否已经使用
     * **/
    let obj = MOBILES[mobile];
    if (!!obj) {
        /** 检查最后一条的发送时间 **/
        let date = obj.date;
        let now = Date.now();
        if (now-date < 60*1000) {
            return {code: STATE_CODE.getCaptchaTooQuick};
        }

        /** 需要判断某个时间段 最大次数 暂定限制 6小时5条 **/
        let count = obj.count;
        if (count > 5) {
            let startDate = obj.startDate;
            let now = Date.now();
            if (now-startDate > 6*60*60*1000) {
                obj.count = 0;
                obj.startDate = Date.now();
            } else {
                return {code: STATE_CODE.tooManyOneDay};
            }
        }
    } else {
        MOBILES[mobile] = {count: 0, startDate: Date.now()};
    }

    let captcha = Math.randomRange(100000, 999999);
    let res = await $.get('http://sms.kingtto.com:9999/sms.aspx', {
        action: 'send',
        userid: 6358,
        account: 'tanbin',
        password: 'tanbin',
        mobile: mobile,
        content: '【大富乐】您的验证码是：'+captcha+'，1小时内有效',
        rt: 'json'
    });
    try {
        res = res.toString();
        res = JSON.parse(res);
        if (!!res && res.ReturnStatus == 'Success') {
            MOBILES[mobile].captcha = captcha;
            MOBILES[mobile].date = Date.now();
            MOBILES[mobile].used = false;
            MOBILES[mobile].count += 1;
            return {code: STATE_CODE.OK};
        } else {
            return {code: STATE_CODE.getCaptchaFail};
        }
    } catch (e) {
        return {code: STATE_CODE.getCaptchaFail};
    }
};