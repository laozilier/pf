String.prototype.format = function (args) {
    if (arguments.length > 0) {
        let result = this;
        if (arguments.length == 1 && typeof args == "object") {
            for (let key in args) {
                let reg = new RegExp("({" + key + "})", "g");
                result = result.replace(reg, args[key]);
            }
        } else {
            for (let i = 0; i < arguments.length; i++) {
                if (arguments[i] == undefined) {
                    return "";
                } else {
                    let reg = new RegExp("({[" + i + "]})", "g");
                    result = result.replace(reg, arguments[i]);
                }
            }
        }
        return result;
    } else {
        return this;
    }
};

cc.Class({
    extends: cc.Component,

    properties: {
        mobileEditBox: {
            default: null,
            type: cc.EditBox,
        },

        codeEditBox: {
            default: null,
            type: cc.EditBox,
        },

        codeBtnLab: {
            default: null,
            type: cc.Label,
        },

        wxBtn: {
            default: null,
            type: cc.Node,
        },
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.checkX(this.node);
        this._codeTime = 60;
        this._coding = false;
    },

    start: function () {
        if (!cc.sys.isNative) {
            this.wxBtn.active = true;
            return;
        }

        this.wxBtn.active = false;
        let sign = cc.sys.localStorage.getItem("login_sign");
        // let sign = 'zTHePeISFoUleqDQlP2k7o/H7SmjOQ77NoKZy7vxay4=';
        if (!!sign) {
            cc.utils.openLayoutWin();
            cc.connect.quickLogin(sign);
        }
    },

    onDisable() {
        this.unschedule(this.closeTips);
    },

    /**
     * 游客登录点击事件
     */
    onLoginStartClicked: function () {
        cc.vv.audioMgr.playButtonSound();
        if ((cc.sys.OS_IOS || cc.sys.OS_ANDROID) && wxApi.isWXAppInstalled()) {
            /** 微信登录 */
            if (wxApi.isWXAppInstalled()) {
                cc.utils.openLayoutWin();
                setTimeout(() => {
                    wxApi.login();
                }, 500);
            } else {
                this.guestLogin();
            }
        } else {
            this.guestLogin();
        }
    },

    /**
     * 手机登录点击事件
     */
    onMobileStartClicked() {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.mobileLogin(this.mobileEditBox.string, this.codeEditBox.string, 553422, (res) => {
            let sign = res.result.sign;
            cc.connect.quickLogin(sign);
        });
    },

    /**
     * 验证码点击事件
     */
    onCodeClicked() {
        cc.vv.audioMgr.playButtonSound();
        if (this._coding) return cc.utils.openWeakTips("请稍后");
        this._coding = true;
        cc.connect.getVerifyCode(this.mobileEditBox.string, (res)=> {
            this.codeCountDown();
            if (!!res && !!res.result && !!res.result.code) {
                this.codeEditBox.string = res.result.code;
            }
        }, (code)=> {
            this._coding = false;
            cc.utils.openWeakTips(cc.utils.getErrorTips(code));
        });
    },

    codeCountDown() {
        if (!this._coding || !this.codeBtnLab) return;
        this._codeTime -= 1;
        if (this._codeTime <= 0) {
            this._codeTime = 60;
            this._coding = false;
            this.codeBtnLab.string = "获取验证码";
        } else {
            this.codeBtnLab.string = this._codeTime + "s";
            setTimeout(() => {
                this.codeCountDown();
            }, 1000);
        }
    },

    guestLogin() {
        /** 游客登录 */
        cc.utils.openLayoutWin();
        let account = cc.args["account"];
        cc.connect.guestLogin(account);
    },

    /**
     * 密码
     * @param event
     */
    onBtnMIMAClicked: function (event) {},

    onDestroy: function () {
        console.log("释放登录场景");
    },
});
