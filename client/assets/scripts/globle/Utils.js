/**cc.dm.user.cc.dm.user.cc.dm.user.cc.dm.user.cc.dm.user.cc.dm.user.
 * Created by apple on 2017/11/7.
 */

//格式化日期
Date.prototype.Format = function (fmt) {
    let o = {
        "M+": this.getMonth() + 1, //月份
        "d+": this.getDate(), //日
        "h+": this.getHours(), //小时
        "m+": this.getMinutes(), //分
        "s+": this.getSeconds(), //秒
        "q+": Math.floor((this.getMonth() + 3) / 3), //季度
        "S": this.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
    for (let k in o)
        if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    return fmt;
};

class Utils {
    constructor() {
        this._keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
        this._signStr = "!#@%&!%@!^()";
        this._mima = ["A","B","B","A","B","A","B","B","A","A","B","B"];
        this._mima = ["A","B","A","B"];
        this._mimaIndex = 0;
    }

    loadPrefabNode(path, cb) {
        cc.loader.loadRes("prefabs/" + path, function (err, res) {
            if(err) {
                console.error(err);
                return;
            }

            let node = cc.instantiate(res);
            if (node == undefined) {
                console.error('loadPrefab undefined path = '+path);
            } else {
                cb && cb(node);
            }
        });
    }

    loadPrefabRes(path, cb) {
        cc.loader.loadRes("prefabs/" + path, function (err, res) {
            if(err) {
                console.error(err);
                return;
            }

            if (res == undefined) {
                console.log('loadPrefab undefined path = '+path);
            } else {
                cb && cb(res);
            }
        });
    }

    /**
     *  打开提示窗口
     * @param text  文字
     * @param ok    确认按钮
     * @param cancel  取消按钮
     * @return alert{Object}
     */
    openTips(text, ok, cancel) {
        let alert = cc.find("Canvas").getChildByName('alertWin');
        if (alert != undefined) {
            let alertScript = alert.getComponent("AlertWin");
            alert.active = true;
            alertScript.show(text, ok, cancel);
            this.hideLayoutWin();
        } else {
            if (this._alerting) {
                setTimeout(function () {
                    this.openTips(text, ok, cancel);
                }.bind(this), 1000);
                return;
            }

            this._alerting = true;
            this.loadPrefabNode('tips_public/alertWin', function (alert) {
                cc.find("Canvas").addChild(alert, 298, 'alertWin');
                let alertScript = alert.getComponent("AlertWin");
                alertScript.show(text, ok, cancel);
                this._alerting = false;
                this.hideLayoutWin();
            }.bind(this));
        }
    }

    /**
     *  打开弱提示窗口
     * @param tips  文字
     */
    openWeakTips(tips) {
        let weakTips = cc.find("Canvas").getChildByName('weakTips');
        if (weakTips != undefined) {
            let alertScript = weakTips.getComponent("WeakTips");
            alertScript.showTips(tips);
        } else {
            if (this._weakTipsing) {
                return;
            }

            this._weakTipsing = true;
            this.loadPrefabNode('tips_public/weakTips', function (weakTips) {
                cc.find("Canvas").addChild(weakTips, 299, 'weakTips');
                let alertScript = weakTips.getComponent("WeakTips");
                alertScript.showTips(tips);
                this._weakTipsing = false;
            }.bind(this));
        }
    }

    /**
     * 请求服务器错误提示
     * @param code  错误代码
     * @param cb    回调方法
     */
    openErrorTips(code, cb) {
        if (code == 200) {
            return;
        }

        let text = this.getErrorTips(code);
        if (text) {
            this.openTips(text, cb);
        } else {
            this.openTips("未知错误: " + code, cb);
        }
    }

    /**
     * 获取错误信息
     * @param {*} code 
     */
    getErrorTips(code) {
        if (code == 200) {
            return;
        }

        let text = cc.connect.StateCode[code];
        return text || ('未知错误: '+code);
    }

    openLayoutWin() {
        let layoutWin = cc.find("Canvas").getChildByName('layoutWin');
        if (layoutWin != undefined) {
            let scr = layoutWin.getComponent("LayoutWin");
            scr.showLayoutWin();
        } else {
            if (this._layouting) {
                return;
            }
            //6230521090029304274
            this._layouting = true;
            this.loadPrefabNode('tips_public/layoutWin', function (layoutWin) {
                cc.find("Canvas").addChild(layoutWin, 999, 'layoutWin');
                let scr = layoutWin.getComponent("LayoutWin");
                scr.showLayoutWin();
                this._layouting = false;
            }.bind(this));
        }
    }

    hideLayoutWin() {
        let layoutWin = cc.find("Canvas").getChildByName('layoutWin');
        if (!!layoutWin) {
            let scr = layoutWin.getComponent("LayoutWin");
            scr.hideLayoutWin();
        } else {
            setTimeout(() => {
                this.hideLayoutWin();
            }, 1000);
        }
    }

    /**
     * 打开加载窗口
     * @param text{Object}
     */
    openLoading(text, isLogin) {
        let alert = cc.find("Canvas").getChildByName('alertWin');
        if (alert != undefined) {
            let alertScript = alert.getComponent("AlertWin");
            alert.active = true;
            alertScript.showLoading(text, isLogin);
        } else {
            if (this._alerting) {
                return;
            }
            //6230521090029304274
            this._alerting = true;
            this.loadPrefabNode('tips_public/alertWin', function (alert) {
                cc.find("Canvas").addChild(alert, 298, 'alertWin');
                let alertScript = alert.getComponent("AlertWin");
                alertScript.showLoading(text, isLogin);
                this._alerting = false;
            }.bind(this));
        }
    }

    closeTips() {
        let alert = cc.find("Canvas").getChildByName('alertWin');
        if (alert != undefined) {
            if (!!alert.autoHideId) {
                clearTimeout(alert.autoHideId);
            }

            alert.active = false;
        }
    }

    /**
     *
     * @param gameName  游戏名字
     * @param exitCb    退出回调
     * @param changecb  改变桌布回调
     */
    showSetting (gameName, exitCb, changeCb) {
        let setting = cc.find("Canvas").getChildByName('setting');
        if (setting != undefined) {
            let settingScript = setting.getComponent("Setting");
            setting.active = true;
            settingScript.show(gameName, exitCb, changeCb);
        } else {
            if (this._setting) {
                return;
            }

            this._setting = true;
            this.loadPrefabNode('tips_public/setting', function (setting) {
                cc.find("Canvas").addChild(setting, 100, 'setting');
                let settingScript = setting.getComponent("Setting");
                settingScript.show(gameName, exitCb, changeCb);
                this._setting = false;
            }.bind(this));
        }
    }

    /**
     * 动态加载商店组件
     */
    showStore(cb, buyid) {
        this.openWeakTips('请联系你的上级代理');
        // if (!!cc.dm.user.pid && cc.dm.user.pid > 0) {
        //     let store = cc.find("Canvas").getChildByName('store');
        //     if (store) {
        //         store.active = true;
        //         store.getComponent('Store').open(cb, buyid);
        //     } else {
        //         if (this._storeing) {
        //             return;
        //         }

        //         this._storeing = true;
        //         this.loadPrefabNode('store', function (store) {
        //             cc.find("Canvas").addChild(store, 99, 'store');
        //             store.getComponent('Store').open(cb, buyid);
        //             this._storeing = false;
        //         }.bind(this));
        //     }
        // } else {
        //     this.openInputInviteCode();
        // }
    }

    /**
     * 动态加载支付类型选择组件
     * @param cb
     */
    openPayType(cb) {
        let payType = cc.find("Canvas").getChildByName('payType');
        if (payType) {
            payType.active = true;
            payType.getComponent('PayType').open(cb);
        } else {
            if (this._payTypeing) {
                return;
            }

            this._payTypeing = true;
            this.loadPrefabNode('tips_public/payType', function (payType) {
                cc.find("Canvas").addChild(payType, 99, 'payType');
                payType.getComponent('PayType').open(cb);
                this._payTypeing = false;
            }.bind(this));
        }
    }

    /**
     * 动态加载上传我的二维二维码地址
     * @param url
     */
    openUpPayQRCode(url, name, cb) {
        let upPayQRCode = cc.find("Canvas").getChildByName('upPayQRCode');
        if (upPayQRCode) {
            upPayQRCode.getComponent('UpPayQRCode').openUpPayQRCode(url, name, cb);
        } else {
            if (this._upPayQRCodeing) {
                return;
            }

            this._upPayQRCodeing = true;
            this.loadPrefabNode('tips_hall/upPayQRCode', function (upPayQRCode) {
                cc.find("Canvas").addChild(upPayQRCode, 100, 'upPayQRCode');
                upPayQRCode.getComponent('UpPayQRCode').openUpPayQRCode(url, name, cb);
                this._upPayQRCodeing = false;
            }.bind(this));
        }
    }

    /**
     * 购买成功提示
     * @param score
     */
    openBuySuc (score) {
        let buySuc = cc.find("Canvas").getChildByName('buySuc');
        if (buySuc) {
            buySuc.active = true;
            buySuc.getComponent('BuySuc').open(score);
        } else {
            if (this._buySucing) {
                return;
            }

            this._buySucing = true;

            this.loadPrefabNode('tips_public/buySuc', function (buySuc) {
                cc.find("Canvas").addChild(buySuc, 100, 'buySuc');
                buySuc.getComponent('BuySuc').open(score);
                this._buySucing = false;
            }.bind(this));
        }
    }

    /**
     * 显示输入邀请码
     */
    openInputInviteCode (cb) {
        let inputInviteCode = cc.find("Canvas").getChildByName('inputInviteCode');
        if (inputInviteCode) {
            inputInviteCode.active = true;
            inputInviteCode.getComponent('InputInviteCode').open(cb);
        } else {
            if (this._inputInviteCoding) {
                return;
            }

            this._inputInviteCoding = true;
            this.loadPrefabNode('tips_public/inputInviteCode', function (inputInviteCode) {
                cc.find("Canvas").addChild(inputInviteCode, 99, 'inputInviteCode');
                inputInviteCode.getComponent('InputInviteCode').open(cb);
                this._inputInviteCoding = false;
            }.bind(this));
        }
    }

    /**
     * 显示我的用户信息
     */
    openMyInfo() {
        let myInfo = cc.find('Canvas').getChildByName('myInfo');
        if (myInfo) {
            myInfo.active = true;
            myInfo.getComponent('MyInfo').show();
        } else {
            if (this._myInfoing) {
                return;
            }

            this._myInfoing = true;
            this.loadPrefabNode('tips_hall/myInfo', function (myInfo) {
                cc.find('Canvas').addChild(myInfo, 99, 'myInfo');
                myInfo.getComponent('MyInfo').show();
                this._myInfoing = false;
            }.bind(this));
        }
    }

    /**
     * 显示代理提示
     */
    openShareTips () {
        let share = cc.find("Canvas").getChildByName('share');
        if (share) {
            share.active = true;
        } else {
            if (this._shareing) {
                return;
            }

            this._shareing = true;
            this.loadPrefabNode('tips_hall/share', function (share) {
                cc.find("Canvas").addChild(share, 99, 'share');
                this._shareing = false;
            }.bind(this));
        }
    }

    /**
     * 显示分享界面
     */
    openQCodeShare() {
        let QRcodeShare = cc.find("Canvas").getChildByName('QRcodeShare');
        if (QRcodeShare) {
            QRcodeShare.active = true;
        } else {
            if (this._QRcodeShareing) {
                return;
            }

            this._QRcodeShareing = true;
            this.loadPrefabNode('tips_hall/qrcodeShare', function (QRcodeShare) {
                cc.find("Canvas").addChild(QRcodeShare, 98, 'QRcodeShare');
                this._QRcodeShareing = false;
            }.bind(this));
        }
    }

    /**
     * 显示代理
     */
    openDealerTips() {
        if (cc.dm.user.subordinate_count < 5) {
            this.openShareTips();
        } else {
            let dealer = cc.find("Canvas").getChildByName('dealer');
            if (dealer) {
                dealer.active = true;
            } else {
                if (this._dealering) {
                    return;
                }

                this._dealering = true;
                this.loadPrefabNode('tips_hall/dealer', function (dealer) {
                    cc.find("Canvas").addChild(dealer, 99, 'dealer');
                    this._dealering = false;
                }.bind(this));
            }
        }

    }

    /**
     * 显示分享选择界面
     * @param shareNode
     */
    openShareTypeWin(shareNode) {
        let shareType = cc.find("Canvas").getChildByName('shareType');
        if (shareType) {
            shareType.active = true;
            shareType.getComponent('ShareType').open(shareNode);
        } else {
            if (this._shareTypeWining) {
                return;
            }

            this._shareTypeWining = true;

            this.loadPrefabNode('tips_hall/shareType', function (shareType) {
                cc.find("Canvas").addChild(shareType, 99, 'shareType');
                shareType.getComponent('ShareType').open(shareNode);
                this._shareTypeWining = false;
            }.bind(this));
        }
    }

    /**
     * 显示代理被亲友圈踢出提示
     * @param cid
     * @param name
     */
    openKickOutTips(clubs, cb) {
        let kickOut = cc.find("Canvas").getChildByName('kickOut');
        if (kickOut) {
            kickOut.active = true;
            kickOut.getComponent('KickOut').open(clubs, cb);
        } else {
            if (this._kickOuting) {
                return;
            }

            this._kickOuting = true;

            this.loadPrefabNode('tips_club/kickOut', function (kickOut) {
                cc.find("Canvas").addChild(kickOut, 100, 'kickOut');
                kickOut.getComponent('KickOut').open(clubs, cb);
                this._kickOuting = false;
            }.bind(this));
        }
    }

    /**
     * 主动退出亲友圈
     * @param tips
     * @param cb
     */
    openExitClubTips(tips, cb) {
        let exitClub = cc.find("Canvas").getChildByName('exitClub');
        if (exitClub) {
            exitClub.active = true;
            exitClub.getComponent('ExitClub').open(tips, cb);
        } else {
            if (this._exitClubing) {
                return;
            }

            this._exitClubing = true;

            this.loadPrefabNode('tips_club/exitClub', function (exitClub) {
                cc.find("Canvas").addChild(exitClub, 100, 'exitClub');
                exitClub.getComponent('ExitClub').open(tips, cb);
                this._exitClubing = false;
            }.bind(this));
        }
    }

    /**
     * 动态加载聊天组件
     */
    showChat(gameName) {
        let chatPrefab = cc.find("Canvas").getChildByName('chatPrefab');
        if (chatPrefab != undefined) {
            let script = chatPrefab.getComponent("Chat");
            chatPrefab.active = true;
            script.onShow(gameName);
        } else {
            if (this._chating) {
                return;
            }

            this._chating = true;
            this.loadPrefabNode('tips_game/chat', function (chatPrefab) {
                cc.find("Canvas").addChild(chatPrefab, 100, 'chatPrefab');
                let script = chatPrefab.getComponent("Chat");
                chatPrefab.active = true;
                script.onShow(gameName);
                this._chating = false;
            }.bind(this));
        }
    }

    /**
     *
     * @param gameName  游戏名字 mj_tj（麻将） diantuo（掂坨） niuniu_mpqz（拼五张） psz（拼三张） pdk（跑得快）
     * @param data      游戏规则
     */
    showRule (gameName, data) {
        let ruleWin = cc.find("Canvas").getChildByName('ruleWin');
        if (ruleWin != undefined) {
            ruleWin.active = true;
            let script = ruleWin.getComponent("RuleWin");
            script.show(gameName, data);
        } else {
            if (this._ruleing) {
                return;
            }

            this._ruleing = true;
            this.loadPrefabNode('tips_game/ruleWin', function (ruleWin) {
                cc.find("Canvas").addChild(ruleWin, 100, 'ruleWin');
                let script = ruleWin.getComponent("RuleWin");
                script.show(gameName, data);
                this._ruleing = false;
            }.bind(this));
        }
    }

    /**
     *
     * @param gameName  游戏名字 mj_tj（麻将） diantuo（掂坨） niuniu_mpqz（拼五张） psz（炸金花） pdk（跑得快）
     * @param data      玩家信息
     */
    showGps (data, need) {
        let GPSWin = cc.find("Canvas").getChildByName('GPSWin');
        if (GPSWin != undefined) {
            GPSWin.active = true;
            let script = GPSWin.getComponent("GPSWin");
            script.show(data, need);
        } else {
            if (this._GPSing) {
                return;
            }

            this._GPSing = true;
            this.loadPrefabNode('tips_game/GPSWin', function (GPSWin) {
                cc.find("Canvas").addChild(GPSWin, 100, 'GPSWin');
                let script = GPSWin.getComponent("GPSWin");
                script.show(data, need);
                this._GPSing = false;
            }.bind(this));
        }
    }

    /**
     *
     * @param gameName  游戏名字 mj_tj（麻将） diantuo（掂坨） niuniu_mpqz（拼五张） psz（拼三张） pdk（跑得快）
     * @param data      玩家信息
     */
    showUserInfo (data, need) {
        let userInfo = cc.find("Canvas").getChildByName('userInfo');
        if (userInfo != undefined) {
            userInfo.active = true;
            let script = userInfo.getComponent("UserInfo");
            script.show(data, need);
        } else {
            if (this._userinfoing) {
                return;
            }

            this._userinfoing = true;
            this.loadPrefabNode('tips_game/userInfo', function (userInfo) {
                cc.find("Canvas").addChild(userInfo, 100, 'userInfo');
                let script = userInfo.getComponent("UserInfo");
                script.show(data, need);
                this._userinfoing = false;
            }.bind(this));
        }
    }

    /**
     * 注册按钮点击事件
     * @param {cc.Node} node    按钮节点
     * @param target  回调节点脚本上下文
     * @param {string} component 脚本名
     * @param {string} handler   回调函数
     * @param customEventData 自定义事件
     */
    addClickEvent(node, target, component, handler, customEventData) {
        if (!!node && !!node.getComponent(cc.Button)) {
            try {
                let eventHandler = new cc.Component.EventHandler();
                eventHandler.target = target;
                eventHandler.component = component;
                eventHandler.handler = handler;
                eventHandler.customEventData = customEventData; //自定义数据

                let clickEvents = node.getComponent(cc.Button).clickEvents || node.getComponent(cc.Toggle).checkEvents;
                clickEvents.push(eventHandler);
            } catch (e) {
                console.log(e);
            }
        }
    }

    /**
     * 随机一个数字
     * @param min 从min开始
     * @param max 到max结束，不包括max
     * @returns {*}
     */
    getRandom(min, max) {
        if (isNaN(min) || isNaN(max))return 0;
        if (min >= max) return min;
        return parseInt(Math.random() * (max - min) + min);

    }

    /**
     * 检查string的正确性，防此拼接字符串时出现null或者undefined
     * 检查string对象是否为空或null
     */
    checkStr(str) {
        if (str === null || str === undefined || typeof str === "object") {
            return "";
        }
        return str;
    }

    /**
     * 解析base64
     * @param content
     * @return {String}
     */
    fromBase64(content, len) {
        if (!content || typeof content != "string" ) {
            return "";
        }

        try {
            let output = "", chr1, chr2, chr3, enc1, enc2, enc3, enc4, i = 0;
            content = content.replace(/[^A-Za-z0-9\+\/\=]/g, "");
            while (i < content.length) {
                enc1 = this._keyStr.indexOf(content.charAt(i++));
                enc2 = this._keyStr.indexOf(content.charAt(i++));
                enc3 = this._keyStr.indexOf(content.charAt(i++));
                enc4 = this._keyStr.indexOf(content.charAt(i++));
                chr1 = (enc1 << 2) | (enc2 >> 4);
                chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
                chr3 = ((enc3 & 3) << 6) | enc4;
                output = output + String.fromCharCode(chr1);
                if (enc3 !== 64) {
                    output = output + String.fromCharCode(chr2);
                }
                if (enc4 !== 64) {
                    output = output + String.fromCharCode(chr3);
                }
            }
            output = this.utf8_decode(output);
            if (!!len) {
                if (output.length > (len+2)) {
                    output = output.substr(0, len);
                    output+='...';
                }
            }
            return output;
        } catch (error) {
            return '';
        }
        
        // content = content == null ? "" : content;
        // return new Buffer(content, 'base64').toString();
    }

    utf8_decode(utftext) {
        let string = "", i = 0, c = 0, c1 = 0, c2 = 0, c3 = 0;
        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                string += String.fromCharCode(c);
                i++;
            } else if ((c > 191) && (c < 224)) {
                c2 = utftext.charCodeAt(i + 1);
                string += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
                i += 2;
            } else {
                c2 = utftext.charCodeAt(i + 1);
                c3 = utftext.charCodeAt(i + 2);
                string += String.fromCharCode(((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63));
                i += 3;
            }
        }
        return string;
    }

    isCN (str) {
        if (str == undefined || str == null || typeof str != 'string' || str.length == 0) {
            return false;
        }

        let stringFlag = true;
        for(let i = 0; i < str.length; i++){
            if(str.charCodeAt(i) <= 255){
                stringFlag = false;
                break;
            }
        }

        return stringFlag;
    }

    isValidCardid (str) {
        if (str == undefined || str == null || typeof str != 'string' || str.length == 0) {
            return false;
        }


        let reg = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
        if(reg.test(str) === false) {
            return false;
        }

        return true;
    }

    isPhoneAvailable (str) {
        let myreg = /^[1][0-9]{10}$/;
        if (!myreg.test(str)) {
            return false;
        } else {
            return true;
        }
    }

    isEmailAvailable (str) {
        let myreg = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
        if (!myreg.test(str)) {
            return false;
        } else {
            return true;
        }
    }

    getScoreStr (score, notyi) {
        let max = 10000;
        if (score == undefined) {
            score = cc.dm.user.score;
            if (score < 0) {
                score = 0;
            }

            max = 100000;
        }

        let str = '';
        if (score < max && score > -max) {
            str = score.toString();
        } else {
            let fix = 0;
            if (score%10000 != 0) {
                fix = 1;
            }
            score -= score%1000;
            score = score/10000;
            if (score < 10000 || !!notyi) {
                str = score.toFixed(fix)+'万';
            } else {
                score = score/10000;
                str = score.toFixed(2)+'亿';
            }
        }

        return str;
    }

    setBgScale (bg) {
        if (!!bg) {
            console.log('setBgScale bg.size = ', bg.getContentSize(), 'cc.winSize = ', cc.winSize);
            bg.width = cc.winSize.width;
            bg.height = cc.winSize.height;
            // if (bg.width/cc.winSize.width < bg.height/cc.winSize.height) {
            //     let scale = bg.height/bg.width;
            //     bg.width = cc.winSize.width;
            //     bg.height = bg.width*scale;
            // } else {
            //     let scale = bg.width/bg.height;
            //     bg.height = cc.winSize.height;
            //     bg.width = bg.height*scale;
            // }
        }
    }

    setNodeWinSize (node) {
        if (!!node) {
            node.width = cc.winSize.width;
            node.height = cc.winSize.height;

            let layout = node.getChildByName('layout');
            if (!!layout) {
                layout.width = cc.winSize.width;
                layout.height = cc.winSize.height;
            }

            let bg = node.getChildByName('bg_full');
            if (!!bg) {
                bg.width = cc.winSize.width;
                bg.height = cc.winSize.height;
            }
        }
    }

    addNet_battery_node () {
        let net_battery_node = cc.find("Canvas").getChildByName('net_battery_node');
        if (net_battery_node != undefined) {
            net_battery_node.active = true;
        } else {
            this.loadPrefabNode('public/net_battery_node', function (net_battery_node) {
                cc.find("Canvas").addChild(net_battery_node, 999, 'setting');
            }.bind(this));
        }
    }

    getQuickBuyid (score) {
        let buyid = 1;
        if (score > 20000000) {
            buyid = 8;
        } else if (score > 10000000) {
            buyid = 7;
        } else if (score > 5000000) {
            buyid = 6;
        } else if (score > 2000000) {
            buyid = 5;
        } else if (score > 1000000) {
            buyid = 4;
        } else if (score > 500000) {
            buyid = 3;
        } else if (score > 100000) {
            buyid = 2;
        }

        return buyid;
    }

    quickBuy (score, cb) {
        let buyid = this.getQuickBuyid(score);

        this.openLoading('正在购买...');
        cc.connect.post('buy', {uid: cc.dm.user.uid, pay_type: 30, id: buyid}, function (res) {
            let payUrl = res.payUrl;
            if (payUrl) {
                cc.order_sn = res.order_sn;
                cc.order_score = data.score;
                cc.sys.openURL(payUrl);
            } else {
                this.openTips('购买成功，获得'+this.getScoreStr(res.score)+'金币');
                cc.dm.user.score+=res.score;
                if (cb) {
                    cb();
                }
            }
        }.bind(this));
    }

    openBuyQRCode(qrcodeUrl) {
        let buyQRCode = cc.find("Canvas").getChildByName('buyQRCode');
        if (buyQRCode != undefined) {
            buyQRCode.active = true;
            let script = buyQRCode.getComponent("BuyQRCode");
            script.show(qrcodeUrl);
        } else {
            if (this._buyQRCoding) {
                return;
            }

            this._buyQRCoding = true;
            this.loadPrefabNode('tips_public/buyQRCode', function (buyQRCode) {
                cc.find("Canvas").addChild(buyQRCode, 1001, 'buyQRCode');
                let script = buyQRCode.getComponent("BuyQRCode");
                script.show(qrcodeUrl);
                this._buyQRCoding = false;
            }.bind(this));
        }
    }

    /**
     * 获取地理位置
     * @returns {undefined}
     */
    getAddrStr () {
        let data = null;
        if(cc.sys.isNative){
            if (cc.sys.os == cc.sys.OS_ANDROID) {
                data = jsb.reflection.callStaticMethod(wxApi.ANDROID_MAP_API, "getAddrStr", "()Ljava/lang/String;");
            }
            else if (cc.sys.os == cc.sys.OS_IOS) {
                data = jsb.reflection.callStaticMethod(wxApi.IOS_API, "getAddrStr");
            }
        }
        return (!data ? undefined : JSON.parse(data));
    };


    openManagerWin(cb) {
        let manager = cc.find("Canvas").getChildByName('manager');
        if (manager != undefined) {
            manager.active = true;
            let script = manager.getComponent('Manager');
            script._cb = cb;
        } else {
            if (this._managering) {
                return;
            }

            this._managering = true;
            this.loadPrefabNode('tips_public/manager', function (manager) {
                cc.find("Canvas").addChild(manager, 199, 'manager');
                let script = manager.getComponent('Manager');
                script._cb = cb;
                this._managering = false;
            }.bind(this));
        }
    };

    ISIPHONEX() {
        let fw = cc.view.getFrameSize().width;
        let fh = cc.view.getFrameSize().height;
        let a = (fw/fh).toFixed(2);
        if (a > 2.15) {
            return true;
        }

        return false;
    };

    ISIPAD() {
        let fw = cc.view.getFrameSize().width;
        let fh = cc.view.getFrameSize().height;
        let a = (fw/fh).toFixed(2);
        if (a < 1.35) {
            return true;
        }

        return false;
    };

    checkX(node) {
        let cvs = node.getComponent(cc.Canvas);
        let fw = cc.view.getFrameSize().width;
        let fh = cc.view.getFrameSize().height;
        if (this.ISIPHONEX()) {
            cvs.designResolution = cc.size(1500, 750);
        } else {
            let a = fw/fh;
            let b = 1334.0/750.0;
            if (a > b) {
                cvs.designResolution = cc.size(Math.floor(750*a), 750);
            } else {
                cvs.designResolution = cc.size(1334, Math.floor(1334/a));
            }
        }

        //this.openWeakTips(`宽度：${Math.floor(fw)}, 高度：${Math.floor(fh)}`);
        node.setContentSize(cvs.designResolution);

        let bg = node.getChildByName('bg');
        this.setBgScale(bg);
    };

    md5 (content) {
        content = content == null ? "" : content;
        let md5 = cc.crypto.createHash('md5');
        md5.update(this._signStr+content+this._signStr);
        return md5.digest('hex');
    };

    md5_hex (content) {
        content = content == null ? "" : content;
        let md5 = cc.crypto.createHash('md5');
        md5.update(content+'^&*#$%()@');
        return md5.digest('hex');
    };

    base64ToStr(str) {
        str = Buffer.from(str,'base64').toString();
        return str;
    }
}

module.exports = new Utils();