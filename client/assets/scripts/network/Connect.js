/**
 *  创建者： THB
 *  日期：2020/4/2
 *  连接服务器逻辑，如掉线重连，请求gate服分配连接
 */

const config = require("./NetworkConfig");

class Connect extends require("./CEvent") {
    constructor() {
        super();
        this.onEvent();
        this.host = config.host;
        this.port = config.port;
        this.logining = false;
    }

    getSaferet(cb) {
        if (!cc.sys.isNative) {
            return;
        }

        if (this._safeTimeout) {
            clearTimeout(this._safeTimeout);
        }

        let saferet = nativeApi.getSaferetNew(config.safekey);
        if (saferet == 150 || saferet == "150") {
            this.host = "127.0.0.1";
            !!cb && cb();
        } else {
            this._safeTimeout = setTimeout(() => {
                this.getSaferet();
            }, 1000);
        }
    }

    /**
     * 注册监听事件
     */
    onEvent() {
        this.on("disconnect", () => {
            console.log("已经掉线");
            /** 如果是登录 则不显示小loading */
            if (!this.logining) {
                cc.utils.openLayoutWin();
            }

            if (!!this._reTimeout) {
                clearTimeout(this._reTimeout);
            }
        });
    }

    /**
     * 游客登录
     * @param {*} account
     */
    guestLogin(account) {
        /**
        if ((cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS)) {
            return;
        }
         */
        if (!account) {
            account = cc.sys.localStorage.getItem("pomelo-account");
        }

        /** 如果没有游客账户，则随机一个时间做为账户 **/
        if (!account) {
            if (cc.sys.isNative) {
                let info = nativeApi.getPhoneInfo();
                if (info && info.deviceId) {
                    account = info.deviceId;
                } else {
                    account = Date.now();
                }
                cc.sys.localStorage.setItem("pomelo-account", account);
            } else {
                account = Date.now();
                cc.sys.localStorage.setItem("pomelo-account", account);
            }
        }
        console.log("游客登录 guestLogin account = ", account);
        this.logining = true;
        window.pomelo.init(
            {
                host: this.host,
                port: this.port,
                log: true,
                reconnect: false,
            },
            () => {
                //发送登录消息
                this.request("gate.gateHandler.guestLogin", { account: account }, (msg) => {
                    if (msg.code === 200) {
                        window.pomelo.disconnect(() => {
                            this.entryPramas = msg;
                            this.loginConnector();
                        });
                    } else {
                        window.pomelo.disconnect();
                        cc.utils.hideLayoutWin();
                        cc.utils.openErrorTips(msg.code);
                    }
                });
            }
        );
    }

    /**
     * 微信注册
     * @param {*} code
     */
    wxRegister(code) {}

    quickLogin(sign) {
        /*
        if ((cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) && this.host != '127.0.0.1') {
            this.getSaferet(() => {
                this.nextQuickLogin(sign);
            });
            return;
        }
        */
        this.nextQuickLogin(sign);
    }

    /**
     * 快速登录第二步
     * @param sign
     */
    nextQuickLogin(sign) {
        console.log("快速登录 sign = ", sign);
        this.logining = true;
        window.pomelo.init(
            {
                host: this.host,
                port: this.port,
                log: true,
                reconnect: false,
            },
            () => {
                //发送登录消息
                this.request("gate.gateHandler.quickLogin", { sign: sign }, (msg) => {
                    if (msg.code === 200) {
                        window.pomelo.disconnect(() => {
                            this.entryPramas = msg;
                            this.loginConnector();
                        });
                    } else {
                        cc.sys.localStorage.removeItem("login_sign");
                        window.pomelo.disconnect();
                        cc.utils.hideLayoutWin();
                        cc.utils.openErrorTips(msg.code);
                    }
                });
            }
        );
    }

    /**
     * 微信登录
     * @param {*} account
     */
    wxLogin(code) {
        /*
        if ((cc.sys.os == cc.sys.OS_ANDROID || cc.sys.os == cc.sys.OS_IOS) && this.host != '127.0.0.1') {
            this.getSaferet(() => {
                this.nextWxLgoin(code);
            });
            return;
        }
        */
        this.nextWxLgoin(code);
    }

    /**
     * 微信登录第二步
     * @param {*} code
     */
    nextWxLgoin(code) {
        if (!!code) {
        } else {
            return;
        }
        this.logining = true;
        window.pomelo.init(
            {
                host: this.host,
                port: this.port,
                log: true,
                reconnect: true,
            },
            () => {
                //发送登录消息
                this.request("gate.gateHandler.wxLogin", { code: code }, (msg) => {
                    if (msg.code === 200) {
                        window.pomelo.disconnect(() => {
                            this.entryPramas = msg;
                            this.loginConnector();
                        });
                    } else {
                        window.pomelo.disconnect();
                        cc.utils.hideLayoutWin();
                        cc.utils.openErrorTips(msg.code);
                    }
                });
            }
        );
    }

    loginConnector() {
        if (!this.entryPramas) {
            return;
        }

        window.pomelo.reconnect = false;
        let host = this.entryPramas.host;
        let port = this.entryPramas.port;
        let sign = this.entryPramas.sign;
        console.log("重新连接 loginConnector");
        window.pomelo.init(
            {
                host: host,
                port: port,
                log: true,
                reconnect: true,
            },
            () => {
                console.log("重新连接 loginConnector  成功");
                this.request("connector.entryHandler.entry", { sign: sign }, (msg) => {
                    if (msg.code === 200) {
                        // this.onEvent();
                        cc.dm.updateUser(msg.result);
                        this.checkReconnectInfo();
                    } else {
                        cc.utils.openWeakTips(cc.utils.getErrorTips(msg.code));
                        // || msg.code == 5022
                        if (msg.code === 5003) {
                            window.pomelo.disconnect();
                        } else {
                            cc.sys.localStorage.removeItem("login_sign");
                            setTimeout(() => {
                                cc.game.restart(); //重新开始游戏
                            }, 1000);
                        }
                    }
                });
            }
        );
    }

    checkReconnectInfo() {
        console.log("checkReconnectInfo cc.sceneName = ", cc.sceneName);
        this.logining = false;

        cc.sys.localStorage.setItem("login_sign", this.entryPramas.sign);

        if (!!this._reTimeout) {
            clearTimeout(this._reTimeout);
        }

        this._checkCount = 0;
        this.checkOrder();
        let cid = cc.dm.user.cid;
        if (!!cid) {
            this.clubInfo(
                cid,
                () => {
                    let roomInfo = cc.dm.user.roomInfo;
                    if (!!roomInfo) {
                        let gameName = roomInfo.gameName;
                        let seats = roomInfo.playerMax;
                        this.inScene(gameName, seats);
                    } else if (!!this.rid) {
                        this.joinRoom(this.rid);
                    } else {
                        if (cc.sceneName == "club" && !!cc.sceneSrc) {
                            cc.utils.hideLayoutWin();
                            cc.sceneSrc.updateInfo();
                        } else {
                            cc.director.loadScene("club");
                        }
                    }
                },
                () => {
                    this._reTimeout = setTimeout(() => {
                        this.checkReconnectInfo();
                    }, 3000);
                }
            );
        } else {
            if (cc.sceneName == "hall" && !!cc.sceneSrc) {
                cc.utils.hideLayoutWin();
                cc.sceneSrc.updateInfo();
            } else {
                cc.director.loadScene("hall");
            }
        }
    }

    checkOrder() {
        if (!!this._orderTimeout) {
            clearTimeout(this._orderTimeout);
        }

        if (this._checkCount > 10) {
            cc.sys.localStorage.removeItem("cc_dm_orderSn");
            return;
        }

        let orderSn = cc.sys.localStorage.getItem("cc_dm_orderSn");
        if (!!orderSn) {
            this.interface(
                "pay/joycenter/query.php",
                { orderSn: orderSn },
                (res) => {
                    if (typeof res == "string") {
                        try {
                            res = JSON.parse(res);
                        } catch (error) {}
                    }

                    if (!!res && res.data && res.data.order_state == "success") {
                        cc.sys.localStorage.removeItem("cc_dm_orderSn");
                    } else {
                        this._orderTimeout = setTimeout(() => {
                            this.checkOrder();
                        }, 2000);
                    }
                },
                (errmsg) => {
                    this._orderTimeout = setTimeout(() => {
                        this.checkOrder();
                    }, 2000);
                }
            );
        }

        this._checkCount += 1;
    }

    /** --------------------------------------------------以下为客户端主动提交事件-------------------------------------------------- */
    /* configHandler 开始 */
    /**
     * 获取分润配置
     * @param {*} suc
     * @param {*} err
     */
    ratios(suc, err) {
        this.request("hall.configHandler.ratios", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 获取分享码
     * @param {*} suc
     * @param {*} err
     */
    inviteUrl(suc, err) {
        this.request("hall.configHandler.inviteUrl", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 获取客服链接
     * @param {*} suc
     * @param {*} err
     */
    getKefuUrl(suc, err) {
        this.request("hall.configHandler.getKefuUrl", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /* configHandler 结束 */

    /* userHandler 开始 */
    /**
     * 同步数据
     * @param {*} suc
     * @param {*} err
     */
    syncInfo(suc, err) {
        this.request("hall.userHandler.syncInfo", {}, (msg) => {
            if (msg.code == 200) {
                let score = msg.result.score;
                cc.dm.user.score = score;
                !!suc && suc();
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 上传地理位置
     */
    updateLocation() {
        if (!this.isLocation) {
            let address = cc.utils.getAddrStr();
            if (address && address.errcode == 0) {
                this.request("hall.userHandler.updateLocation", { location: JSON.stringify(address) });
                this.isLocation = address;
            }
        }
    }

    /**
     * 公告
     * @param {*} suc
     * @param {*} err
     */
    hallNotice(suc, err) {
        this.request("hall.noticeHandler.hallNotice", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result.msg);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * http 检查版本强制更新
     * @param {*} sysos
     * @param {*} build
     * @param {*} suc
     * @param {*} err
     */
    checkVersion(sysos, build, suc, err) {
        this.httpSend("http://" + this.host + ":30000/checkVersion", "GET", { os: sysos, build: build, version: 10001 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                !!err && err();
            }
        });
    }

    /**
     * http 获取验证码
     * @param {*} mobile
     */
    getVerifyCode(mobile, suc, err) {
        this.httpSend("http://" + this.host + ":30000/getVerifyCode", "GET", { mobile }, suc, err);
    }

    /**
     * http 手机登录
     * @param {*} mobile
     * @param {*} code
     * @param {*} inviteCode
     * @param {*} suc
     */
    mobileLogin(mobile, code, inviteCode, suc) {
        cc.utils.openLayoutWin();
        this.httpSend("http://" + this.host + ":30000/mobileLogin", "GET", { mobile, code, inviteCode }, suc, (code)=> {
            cc.utils.openErrorTips(code);
        });
    }

    /**
     * 上传用户备注
     * @param {*} remarks
     */
    updateRemarks(remarks) {
        if (typeof remarks == "string") {
            cc.utils.openLayoutWin();
            this.request("hall.userHandler.updateRemarks", { remarks: remarks }, (msg) => {
                cc.utils.hideLayoutWin();
                if (msg.code == 200) {
                    cc.utils.openWeakTips("保存用户备注成功");
                    cc.dm.updateUserKey("remarks", remarks);
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            });
        }
    }

    /**
     * 上传二维码
     * @param {*} url
     * @param {*} name
     * @param {*} suc
     * @param {*} err
     */
    savePaymentCode(url, name, suc, err) {
        if (typeof url == "string") {
            cc.utils.openLayoutWin();
            this.request("hall.userHandler.savePaymentCode", { paymentUrl: url, name: name }, (msg) => {
                cc.utils.hideLayoutWin();
                if (msg.code == 200) {
                    cc.utils.openWeakTips("保存二维码成功");
                    cc.dm.user.paymentUrl = url;
                    cc.dm.user.paymentName = name;
                    !!suc && suc(msg.result);
                } else {
                    if (!!err) {
                        err(cc.utils.getErrorTips(msg.code));
                    } else {
                        cc.utils.openErrorTips(msg.code);
                    }
                }
            });
        }
    }

    /**
     * 管理员上传二维码
     * @param {*} uid
     * @param {*} url
     * @param {*} name
     * @param {*} suc
     * @param {*} err
     */
    managerSavePaymentCode(uid, url, name, suc, err) {
        if (typeof url == "string") {
            cc.utils.openLayoutWin();
            this.request("hall.clubMemberHandler.managerSavePaymentCode", { paymentUrl: url, uid: uid, name: name }, (msg) => {
                cc.utils.hideLayoutWin();
                if (msg.code == 200) {
                    cc.utils.openWeakTips("保存二维码成功");
                    !!suc && suc(msg.result);
                } else {
                    if (!!err) {
                        err(cc.utils.getErrorTips(msg.code));
                    } else {
                        cc.utils.openErrorTips(msg.code);
                    }
                }
            });
        }
    }

    /**
     * 搜索用户
     * @param {*} uid
     * @param {*} suc
     * @param {*} err
     */
    searchUser(uid, suc, err) {
        this.request("hall.userHandler.searchUser", { uid: uid }, (msg) => {
            if (msg.code == 200) {
                if (!msg.result || msg.result.uid == 0) {
                    if (!!err) {
                        err(cc.utils.getErrorTips(5004));
                    } else {
                        cc.utils.openErrorTips(5004);
                    }
                } else {
                    !!suc && suc(msg.result);
                }
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 绑定上级
     * @param {*} pid
     * @param {*} suc
     * @param {*} err
     */
    bindParent(pid, suc, err) {
        if (typeof pid == "number") {
            cc.utils.openLayoutWin();
            this.request("hall.userHandler.bindParent", { pid: pid }, (msg) => {
                cc.utils.hideLayoutWin();
                if (msg.code == 200) {
                    cc.dm.user.pid = pid;
                    cc.dm.user.cid = msg.result.cid;
                    cc.utils.openWeakTips("绑定上级成功");
                    !!suc && suc();
                } else {
                    if (!!err) {
                        err(cc.utils.getErrorTips(msg.code));
                    } else {
                        cc.utils.openErrorTips(msg.code);
                    }
                }
            });
        }
    }

    /**
     * 下分
     * @param {*} score
     * @param {*} suc
     * @param {*} err
     */
    withdrawScore(score, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.withdrawHandler.withdrawScore", { score: score }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("转存成功");
                !!suc && suc(msg);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 下分列表
     * @param {*} url
     * @param {*} status
     * @param {*} page
     * @param {*} pagesize
     * @param {*} suc
     * @param {*} err
     */
    withdrawList(url, status, page, pagesize, suc, err) {
        this.request(url, { status: status, page: page, pagesize: pagesize }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 充值记录
     * @param {*} suc
     * @param {*} err
     */
    rechargeHistory(suc, err) {
        this.request("hall.userHandler.rechargeHistory", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 转出记录
     * @param {*} suc
     * @param {*} err
     */
    playerWithdrawHistory(suc, err) {
        this.request("hall.userHandler.playerWithdrawHistory", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 道具列表
     * @param {*} suc
     * @param {*} err
     */
    rechargeProp(suc, err) {
        this.request("hall.propHandler.rechargeProp", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 提交投诉
     * @param {*} type
     * @param {*} remark
     * @param {*} suc
     * @param {*} err
     */
    complaint(type, remark, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.noticeHandler.complaint", { type: type, remark: remark }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("提交成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 获取绑定微信二维码链接
     * @param {*} suc
     * @param {*} err
     */
    bindWithdrawWechat(suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.userHandler.bindWithdrawWechat", {}, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 绑定手机
     * @param {*} mobile
     * @param {*} captcha
     * @param {*} suc
     * @param {*} err
     */
    bindMobile(mobile, captcha, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.userHandler.bindMobile", { mobile: mobile, captcha: captcha }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("绑定手机成功");
                cc.dm.user.mobile = mobile;
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 发送验证码
     * @param {*} mobile
     * @param {*} suc
     * @param {*} err
     */
    sendCaptcha(mobile, suc, err) {
        this.request("hall.userHandler.sendCaptcha", { mobile: mobile }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 设置分润比例
     * @param {*} cid
     * @param {*} uid
     * @param {*} ratio
     * @param {*} suc
     * @param {*} err
     */
    setProfitRatio(cid, uid, ratio, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.userHandler.setProfitRatio", { cid: cid, uid: uid, ratio: ratio }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("设置分润比例成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 获取我的赠送记录
     * @param {*} page
     * @param {*} suc
     * @param {*} err
     */
    giveHistory(page, suc, err) {
        this.request("hall.userHandler.giveHistory", { page: page, pagesize: 7 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 封禁解封账号
     * @param {*} cid
     * @param {*} uid
     * @param {*} suc
     * @param {*} err
     */
    sealUpAccount(cid, uid, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.userHandler.sealUpAccount", { cid: cid, uid: uid }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("封禁或解封账号成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /* userHandler 结束 */

    /* clubHandler 开始 */

    /**
     * 创建亲友群
     * @param {*} name
     * @param {*} suc
     * @param {*} err
     */
    createClub(name, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.create", { name: name }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("创建亲友群成功");
                let cid = msg.clubid;
                cc.dm.user.cid = cid;
                !!suc && suc(cid);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 亲友群信息
     * @param {*} cid
     * @param {*} suc
     * @param {*} err
     */
    clubInfo(cid, suc, err) {
        if (cc.sys.isNative) {
            this.httpSend("http://" + this.host + ":30000/clubInfo", "GET", { cid: cid, uid: cc.dm.user.uid }, (msg) => {
                if (msg.code == 200) {
                    cc.dm.clubInfo = msg.result;
                    cc.dm.initEvent();
                    this.request("hall.clubHandler.subscribe", { cid: cid });
                    !!suc && suc();
                } else {
                    !!err && err();
                }
            });
        } else {
            this.request("hall.clubHandler.clubInfo", { cid: cid }, (msg) => {
                if (msg.code == 200) {
                    cc.dm.clubInfo = msg.result;
                    cc.dm.initEvent();
                    !!suc && suc();
                } else {
                    !!err && err();
                }
            });
        }
    }

    /**
     * 修改亲友群名字
     * @param {*} cid
     * @param {*} name
     * @param {*} suc
     * @param {*} err
     */
    setName(cid, name, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.setName", { cid: cid, name: name }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("修改亲友群名字成功");
                !!suc && suc();
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 亲友群规则信息
     * @param {*} cid
     * @param {*} suc
     * @param {*} err
     */
    privateRooms(cid, suc, err) {
        this.request("hall.clubHandler.privateRooms", { cid: cid }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                !!err && err(cc.utils.getErrorTips(msg.code));
            }
        });
    }

    /**
     * 亲友群桌子信息
     * @param {*} cid
     * @param {*} suc
     * @param {*} err
     */
    tables(cid, suc, err) {
        this.request("hall.clubHandler.tables", { cid: cid }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                !!err && err(cc.utils.getErrorTips(msg.code));
            }
        });
    }

    /**
     * 创建规则
     * @param {*} cid
     * @param {*} rule
     * @param {*} suc
     * @param {*} err
     */
    createPrivateRoom(cid, rule, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.createPrivateRoom", { cid: cid, rule: rule }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("创建包间规则成功");
                !!suc && suc(msg.insertId);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 修改包间规则
     * @param {*} cid
     * @param {*} prid
     * @param {*} rule
     * @param {*} suc
     * @param {*} err
     */
    changePrivateRoom(cid, prid, rule, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.changePrivateRoom", { cid: cid, prid: prid, rule: rule }, (msg) => {
            if (msg.code == 200) {
                cc.utils.hideLayoutWin();
                cc.utils.openWeakTips("修改包间规则成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 删除包间规则
     * @param {*} cid
     * @param {*} prid
     * @param {*} suc
     * @param {*} err
     */
    deletePrivateRoom(cid, prid, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.deletePrivateRoom", { cid: cid, prid: prid }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("删除包间规则成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 修改包间名字
     * @param {*} cid
     * @param {*} prid
     * @param {*} name
     * @param {*} suc
     * @param {*} err
     */
    changePrivateRoomName(cid, prid, name, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.changePrivateRoomName", { cid: cid, prid: prid, name: name }, (msg) => {
            if (msg.code == 200) {
                cc.utils.hideLayoutWin();
                cc.utils.openWeakTips("修改包间名字成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 修改包间最大开桌数
     * @param {*} cid
     * @param {*} prid
     * @param {*} max
     * @param {*} suc
     * @param {*} err
     */
    changePRMax(cid, prid, max, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.changePRMax", { cid: cid, prid: prid, max: max }, (msg) => {
            if (msg.code == 200) {
                cc.utils.hideLayoutWin();
                cc.utils.openWeakTips("修改包间最大开桌数成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 成员列表
     * @param {*} cid
     * @param {*} page
     * @param {*} uid
     * @param {*} suc
     * @param {*} err
     */
    members(cid, page, uid, suc, err) {
        this.request("hall.clubHandler.members", { cid: cid, page: page, uid: uid, size: cc.utils.ISIPAD() ? 12 : 9 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                !!err && err(cc.utils.getErrorTips(msg.code));
            }
        });
    }

    /**
     * 设置管理员
     * @param {*} cid
     * @param {*} uid
     * @param {*} suc
     * @param {*} err
     */
    setAdmin(cid, uid, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.setAdmin", { cid: cid, uid: uid }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("设置或取消管理员成功");
                !!suc && suc();
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 设置拉黑
     * @param {*} cid
     * @param {*} uid
     * @param {*} blacklist
     * @param {*} suc
     * @param {*} err
     */
    blacklist(cid, uid, blacklist, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.blacklist", { cid: cid, uid: uid, blacklist: blacklist }, (msg) => {
            if (msg.code == 200) {
                cc.utils.hideLayoutWin();
                cc.utils.openWeakTips(blacklist == 1 ? "拉黑成功" : "取消拉黑成功");
                !!suc && suc();
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 游戏排序
     * @param {*} cid
     * @param {*} prid
     * @param {*} moveUp
     * @param {*} suc
     * @param {*} err
     */
    moveUpWeight(cid, prid, moveUp, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.moveUpWeight", { cid: cid, prid: prid, moveUp: moveUp }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("包间规则排序成功");
                !!suc && suc();
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 解散亲友群
     * @param {*} cid
     * @param {*} suc
     * @param {*} err
     */
    dismissClub(cid, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubHandler.dismiss", { cid: cid, prid: prid, moveUp: true }, (msg) => {
            if (msg.code == 200) {
                cc.utils.hideLayoutWin();
                cc.utils.openWeakTips("解散亲友群成功");
                !!suc && suc();
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 亲友群成员详情
     * @param {*} cid
     * @param {*} uid
     * @param {*} suc
     * @param {*} err
     */
    detailUserInfo(cid, uid, suc, err) {
        this.request("hall.clubMemberHandler.detailUserInfo", { cid: cid, uid: uid }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 赠送分数
     * @param {*} uid
     * @param {*} score
     * @param {*} cid
     * @param {*} suc
     * @param {*} err
     */
    giveScore(uid, score, cid, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubMemberHandler.giveScore", { uid: uid, cid: cid, score: score }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("赠送成功");
                !!suc && suc();
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 亲友群成员充值记录
     * @param {*} uid
     * @param {*} cid
     * @param {*} page
     * @param {*} suc
     * @param {*} err
     */
    clubMemberRechargeHistory(uid, cid, page, suc, err) {
        this.request("hall.clubMemberHandler.rechargeHistory", { uid: uid, cid: cid, page: page, pagesize: 7 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 亲友群成员转出记录
     * @param {*} uid
     * @param {*} cid
     * @param {*} page
     * @param {*} suc
     * @param {*} err
     */
    clubMemberWithdrawHistory(uid, cid, page, suc, err) {
        this.request("hall.clubMemberHandler.withdrawHistory", { uid: uid, cid: cid, page: page, pagesize: 7 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 亲友群成员赠送记录
     * @param {*} uid
     * @param {*} cid
     * @param {*} page
     * @param {*} suc
     * @param {*} err
     */
    clubMemberGiveScoreHistory(uid, cid, page, suc, err) {
        this.request("hall.clubMemberHandler.giveScoreHistory", { uid: uid, cid: cid, page: page, pagesize: 7 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 给用户增加积分
     * @param {*} uid
     * @param {*} cid
     * @param {*} score
     * @param {*} suc
     * @param {*} err
     */
    addScore(uid, cid, score, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubMemberHandler.addScore", { uid: uid, cid: cid, score: score }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("增加积分成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 给用户扣除积分
     * @param {*} uid
     * @param {*} cid
     * @param {*} score
     * @param {*} suc
     * @param {*} err
     */
    decreaseScore(uid, cid, score, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.clubMemberHandler.decreaseScore", { uid: uid, cid: cid, score: score }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("扣除积分成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 亲友群统计
     * @param {*} suc
     * @param {*} err
     */
    statistic(suc, err) {
        this.request("hall.clubHandler.statistic", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 亲友群历史数据
     * @param {*} suc
     * @param {*} err
     */
    statisticHistory(suc, err) {
        this.request("hall.clubHandler.statisticHistory", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /* clubHandler 结束 */

    /* historyHandler 开始 */
    /**
     * 自己或某个成员战绩
     * @param {*} gameName
     * @param {*} cid
     * @param {*} uid
     * @param {*} page
     * @param {*} pageSize
     * @param {*} suc
     * @param {*} err
     */
    clubUserHistory(gameName, cid, uid, page = 1, pageSize = 4, suc, err) {
        this.request("hall.historyHandler.clubUserHistory", { gameName: gameName, cid: cid, uid: uid, page: page, pageSize: pageSize }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                !!err && err(cc.utils.getErrorTips(msg.code));
            }
        });
    }

    /**
     * 亲友群所有战绩
     * @param {*} gameName
     * @param {*} cid
     * @param {*} page
     * @param {*} pageSize
     * @param {*} suc
     * @param {*} err
     */
    clubAllHistory(gameName, cid, page = 1, pageSize = 4, suc, err) {
        this.request("hall.historyHandler.clubAllHistory", { gameName: gameName, cid: cid, page: page, pageSize: pageSize }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                !!err && err(cc.utils.getErrorTips(msg.code));
            }
        });
    }

    /* historyHandler 结束 */

    /* roomHandler 开始 */
    /**
     * 创建游戏
     * @param {*} data
     */
    createRoom(data) {
        cc.utils.openLayoutWin();
        this.request("hall.roomHandler.createRoom", data, (msg) => {
            if (msg.code == 200) {
                this.joinRoom(msg.rid);
            } else {
                cc.utils.hideLayoutWin();
                cc.utils.openErrorTips(msg.code);
            }
        });
    }

    /**
     * 亲友群创建游戏
     * @param {*} prid
     * @param {*} cid
     */
    createClubGame(prid, cid) {
        cc.utils.openLayoutWin();
        this.request("hall.roomHandler.createClubGame", { prid: prid, cid: cid, uid: cc.dm.user.uid }, (msg) => {
            if (msg.code == 200) {
                this.joinRoom(msg.rid);
            } else {
                cc.utils.hideLayoutWin();
                cc.utils.openErrorTips(msg.code);
            }
        });
    }

    /**
     * 加入游戏
     * @param {*} rid
     */
    joinRoom(rid) {
        cc.utils.openLayoutWin();
        this.request("hall.roomHandler.joinRoom", { rid: rid }, (msg) => {
            if (msg.code == 200) {
                this.rid = rid;
                let gameName = msg.gameName;
                let seats = msg.seats;
                this.inScene(gameName, seats);
            } else {
                cc.utils.hideLayoutWin();
                this.rid = undefined;
                if (cc.sceneName == "club" && !!cc.sceneSrc) {
                    cc.utils.openErrorTips(msg.code);
                } else {
                    cc.director.loadScene("club");
                }
            }
        });
    }

    inScene(gameName, seats) {
        let sceneName = gameName;
        if (gameName.indexOf("niuniu") > -1 || gameName.indexOf("sanshui") > -1) {
            if (!!seats) {
                sceneName = gameName + "_" + seats;
            }
        }

        if (cc.sceneName == "gameScene") {
            console.log("游戏场景已经存在 gameName = ", gameName, "sceneName = ", sceneName);
            cc.utils.hideLayoutWin();
            this.getRoomInfo();
            return;
        }

        console.log("加载游戏场景， gameName = ", gameName, "sceneName = ", sceneName);
        cc.gameName = gameName;
        cc.director.loadScene(sceneName, () => {
            this.getRoomInfo();
        });
    }

    /**
     * 获取房间信息
     * @param {*} rid
     * @param {*} suc
     * @param {*} err
     */
    roomInfo(rid, suc, err) {
        this.request("hall.roomHandler.roomInfo", { rid: rid }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                !!err && err(cc.utils.getErrorTips(msg.code));
            }
        });
    }

    /**
     * 解散房间
     * @param {*} rid
     * @param {*} cid
     * @param {*} suc
     * @param {*} err
     */
    clubDismissRoom(rid, cid, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.roomHandler.clubDismissRoom", { rid: rid, cid: cid }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("解散成功");
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /* roomHandler 结束 */

    /* dealerHandler 开始 */
    /**
     * 我的代理信息
     * @param {*} suc
     * @param {*} err
     */
    myInfo(suc, err) {
        this.request("hall.dealerHandler.myInfo", {}, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 代理转出明细
     * @param {*} page
     * @param {*} suc
     * @param {*} err
     */
    withdrawHistory(page, suc, err) {
        this.request("hall.dealerHandler.withdrawHistory", { page: page, pagesize: 5 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 下级列表
     * @param {*} category
     * @param {*} page
     * @param {*} suc
     * @param {*} err
     */
    subordinateList(category, page, suc, err) {
        this.request("hall.dealerHandler.subordinateList", { category: category, page: page, pagesize: 10 }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                }
            }
        });
    }

    /**
     * 代理转出
     * @param {*} score
     * @param {*} suc
     * @param {*} err
     */
    dealerWithdrawScore(score, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.dealerHandler.withdraw", { score: score }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("转存到微信成功");
                !!suc && suc(msg);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /**
     * 转出到游戏中
     * @param {*} score
     * @param {*} suc
     * @param {*} err
     */
    dealerWithdrawScoreToGame(score, suc, err) {
        cc.utils.openLayoutWin();
        this.request("hall.dealerHandler.withdrawGame", { score: score }, (msg) => {
            cc.utils.hideLayoutWin();
            if (msg.code == 200) {
                cc.utils.openWeakTips("转出到游戏成功");
                !!suc && suc(msg);
            } else {
                if (!!err) {
                    err(cc.utils.getErrorTips(msg.code));
                } else {
                    cc.utils.openErrorTips(msg.code);
                }
            }
        });
    }

    /* dealerHandler 结束 */

    /* httpHandler 开始 */
    interface(path, data, suc, err) {
        this.request("hall.httpHandler.interface", { path: path, data: data }, (msg) => {
            if (msg.code == 200) {
                !!suc && suc(msg.result);
            } else {
                if (!!err) {
                    err(msg.code);
                }
            }
        });
    }
    /* httpHandler 结束 */

    /* 游戏房间内部消息 开始 */
    rpc(event, data) {
        let param = {};
        if (event != undefined) {
            param.e = event;
        }

        if (data != undefined) {
            param.d = data;
        }

        this.request("room.gameHandler.z", param, (msg) => {
            if (msg.code == 200) {
            } else {
            }
        });
    }

    send(event, data) {
        let param = {};
        if (event != undefined) {
            param.e = event;
        }

        if (data != undefined) {
            param.d = data;
        }

        this.request("room.gameHandler.s", param, (msg) => {
            if (msg.code == 200) {
            } else {
            }
        });
    }

    /**
     * 解散房间
     * 只有房主才能解散房间
     * @param uid 玩家uid
     */
    dismiss() {
        this.rpc("dismiss");
    }

    okDismiss() {
        this.rpc("okDismiss");
    }

    notDismiss() {
        this.rpc("notDismiss");
    }

    /**
     * 申请解散房间
     * 只有正在玩的人才能解散房间
     */
    applyDismiss() {
        this.rpc("applyDismiss");
    }

    /**
     * 获取房间信息
     */
    getRoomInfo() {
        this.rpc("roomInfo");
    }

    /**
     * 坐下
     */
    sitDown() {
        this.rpc("sitDown");
    }

    /**
     * 离开房间
     * 只有游客和房间未开始时，才能离开房间
     */
    leave() {
        this.rpc("leave");
    }

    /**
     * 准备
     */
    ready() {
        this.rpc("ready");
    }

    /**
     * 发送表情
     */
    emoji(id) {
        this.rpc("emoji", id);
    }

    /**
     * 聊天
     */
    chat(str) {
        if (str === "" || str === undefined || str === null) {
            console.log("聊天信息不能为空 chat = " + str);
        } else {
            this.rpc("chat", str);
        }
    }

    /**
     * 语音
     * @param msg 语音
     * @param time 语音时间
     */
    voice(msg, time) {
        this.rpc("voice", [msg, time]);
    }

    /**
     * 常用语
     */
    cWord(id) {
        this.rpc("cWord", id);
    }

    /**
     * 发送动画，扔的动画
     * @param suid 开始位置
     * @param euid 结束位置
     * @param id 动画id
     */
    animate(suid, euid, id) {
        this.rpc("animate", [suid, euid, id]);
    }

    /**
     * 设置托管
     */
    tuoGuang() {
        this.rpc("tuoGuang");
    }

    /**
     * 回复收庄
     */
    res_shouzhuang(data) {
        this.rpc("res_shouzhuang", data);
    }

    /* ------------------------------------------------------------------------------------------------------------------------ */
    /**
     *
     * @param url
     * @param method
     * @param params
     * @param suc
     * @param err
     */
    httpSend(url, method, params, suc, err) {
        let xhr = cc.loader.getXMLHttpRequest();
        let isTimeout = false;
        let context = "";
        if (!/post/i.test(method)) {
            context = this.queryString(params);
        }

        let URI = url + context;

        xhr.open(method || "GET", URI, true);

        //设置请求头
        if (cc.sys.isNative && /get/i.test(method)) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
        }
        if (/post/i.test(method)) {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && !isTimeout) {
                isTimeout = true;
                if (xhr.status >= 200 && xhr.status < 300) {
                    let ret = xhr.responseText;
                    try {
                        ret = JSON.parse(xhr.responseText);
                        ret.code = parseInt(ret.code);
                    } catch (e) {
                        console.log("e = ", JSON.stringify(e));
                        console.log("xhr.responseText = ", xhr.responseText);
                        ret = { code: -888 };
                    }

                    if (!cc.sys.isNative) {
                        console.log(JSON.stringify({ url: URI, params: params, msgLen: xhr.responseText.length, result: ret }));
                    }

                    if (ret.code == 200) {
                        !!suc && suc(ret);
                    } else {
                        !!err && err(ret.code);
                    }
                } else {
                    if (!cc.sys.isNative) {
                        console.log(JSON.stringify({ url: URI, result: [41, "服务器忙，请稍后在试"] }));
                    }

                    !!err && err(41);
                }
            }
        };

        if (/post/i.test(method)) {
            xhr.send("param=" + JSON.stringify(params || {}));
        } else {
            xhr.send();
        }

        setTimeout(function () {
            if (!isTimeout) {
                isTimeout = true;
                console.log(URI, params, "连接超时");
                !!err && err(42);
            }
        }, 15000);
    }

    /**
     *
     * @param url
     * @param method
     * @param params
     * @param suc
     * @param err
     */
    httpTest(url, method, params, suc, err) {
        let xhr = cc.loader.getXMLHttpRequest();
        let isTimeout = false;
        let context = "";
        if (!/post/i.test(method)) {
            context = this.queryString(params);
        }

        let URI = url + context;

        xhr.open(method || "GET", URI, true);

        //设置请求头
        if (cc.sys.isNative && /get/i.test(method)) {
            xhr.setRequestHeader("Accept-Encoding", "gzip,deflate", "text/html;charset=UTF-8");
        }
        if (/post/i.test(method)) {
            xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded;charset=UTF-8");
        }

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4 && !isTimeout) {
                isTimeout = true;
                if (xhr.status >= 200 && xhr.status < 300) {
                    !!suc && suc();
                } else {
                    !!err && err();
                }
            }
        };

        if (/post/i.test(method)) {
            xhr.send("param=" + JSON.stringify(params || {}));
        } else {
            xhr.send();
        }

        setTimeout(function () {
            if (!isTimeout) {
                isTimeout = true;
                !!err && err();
            }
        }, 5000);
    }

    /**
     * 将参数转找成链接形式
     * @param context
     * @return {*}
     */
    queryString(context) {
        if (!context || typeof context !== "object") {
            return "";
        }
        let str = "?";
        for (let k in context) {
            str === "?" || (str += "&");
            str += k + "=" + context[k];
        }
        return str;
    }
}

module.exports = new Connect();
