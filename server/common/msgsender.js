//********************** 模块引用开始 ***********************
const Core = require("@alicloud/pop-core");
//********************** 模块引用开始 ***********************

//********************** 主逻辑开始 ***********************
class MsgSender {
    constructor() {
        //初始化短信网关参数
        this.client = new Core({
            accessKeyId: "",
            accessKeySecret: "",
            endpoint: "https://dysmsapi.aliyuncs.com",
            apiVersion: "2017-05-25",
        });

        this.params = {
            PhoneNumbers: "",
            SignName: "",
            TemplateCode: "",
            TemplateParam: "",
        };
    }

    /**
     * 发送短信相关函数
     * @param mobile
     * @param ip
     * @returns {Promise<{code, msg, data}>}
     * @constructor
     */
    Send(mobile, ip) {
        /** 检查手机号 **/
        if (!this.IsMobile(mobile)) {
            return { code: STATE_CODE.mobileError };
        }

        /** 补充参数 **/
        let smscode = this.GetRandomNum(6);
        console.log("smscode = ", smscode);
        MOBILES[mobile] = { code: smscode, expireTime: Date.now() + 300000, nextTime: Date.now() + 60000 };
        return { code: STATE_CODE.OK, result: { code: smscode } };

        this.params.PhoneNumbers = mobile;
        this.params.TemplateParam = JSON.stringify({ code: smscode });

        let requestOption = { method: "POST" };

        return new Promise((resolve) => {
            this.client.request("SendSms", this.params, requestOption).then(
                (result) => {
                    if (result.Code == "OK") {
                        MOBILES[mobile] = { code: smscode, expireTime: Date.now() + 300000, nextTime: Date.now() + 60000 };
                        resolve({ code: STATE_CODE.OK });
                    } else {
                        console.error(JSON.stringify(result));
                        resolve({ code: STATE_CODE.getCaptchaFail });
                    }
                },
                (err) => {
                    console.error(err);
                    resolve({ code: STATE_CODE.getCaptchaFail });
                }
            );
        });
    }

    /**
     * 判断手机号码
     * @param mobile
     * @returns {boolean}
     * @constructor
     */
    IsMobile(mobile) {
        if (typeof mobile != "string") {
            return false;
        }

        return /^1[3456789]\d{9}$/.test(mobile);
    }

    /**
     * 获取时间戳
     * @returns {number}
     * @constructor
     */
    TimeStamp() {
        return Date.now();
    }

    /**
     * 获取随机字符串
     * @param len
     * @returns {string}
     * @constructor
     */
    GetRandomNum(len) {
        let $chars = "1234567890";
        let maxPos = $chars.length;
        let pwd = "";
        for (let i = 0; i < len; i++) {
            pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
        }
        return pwd;
    }
}

//********************** 主逻辑结束 ***********************

//********************** 模块接口开始 ***********************
module.exports = new MsgSender();
//********************** 模块接口结束 ***********************
