// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        editBox: {
            default: null,
            type: cc.EditBox
        },

        wxNode: {
            default: null,
            type: cc.Node
        },

        qrNode: {
            default: null,
            type: cc.Node
        },

        qrMa: {
            default: null,
            type: cc.Node
        },

        qrName: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
        this._minscore = 100000;
    },

    start () {

    },

    open() {
        this.editBox.string = '';
        /*
        let infoNode = this.wxNode.getChildByName('infoNode');
        let noNode = this.wxNode.getChildByName('noNode');
        if (cc.dm.checkWechat()) {
            infoNode.active = true;
            noNode.active = false;
            let headNode = infoNode.getChildByName('headNode');
            headNode.getComponent('HeadNode').updateData(cc.dm.user.weChat.headimg);
            let nicknameLab = infoNode.getChildByName('nickname');
            nicknameLab.getComponent(cc.Label).string = '昵称: '+cc.dm.user.weChat.nickname;
            let realnameLab = infoNode.getChildByName('realname');
            realnameLab.getComponent(cc.Label).string = '昵称: '+cc.dm.user.weChat.realname;
        } else {
            infoNode.active = false;
            noNode.active = true;
        }

        this.checkQR();
        */
    },

    checkQR () {
        let url = cc.dm.user.paymentUrl;
        let isAli = (url.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || url.indexOf('https://qr.alipay.com/') > -1);
        let isWx = (url.indexOf('wxp://') > -1 || url.indexOf('payapp.weixin.qq.com') > -1);
        if (!!url && (isAli || isWx)) {
            this.qrNode.active = true;
            this.scheduleOnce(function () {
                let qrcode = new QRCode(-1, QRErrorCorrectLevel.M);
                qrcode.addData(url);
                qrcode.make();
                let ctx = this.qrMa.getComponent(cc.Graphics);
                ctx.clear();
                ctx.fillColor = isAli ? cc.hexToColor('#00A0E9') : cc.hexToColor('#3CAF36');
                // compute tileW/tileH based on node width and height
                let tileW = this.qrMa.width / qrcode.getModuleCount();
                let tileH = this.qrMa.height / qrcode.getModuleCount();
    
                // draw in the Graphics
                for (let row = 0; row < qrcode.getModuleCount(); row++) {
                    for (let col = 0; col < qrcode.getModuleCount(); col++) {
                        if (qrcode.isDark(row, col)) {
                            let w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                            let h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                            ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                            ctx.fill();
                        }
                    }
                }
            }, 0.3);
    
            if (!!cc.dm.user.paymentName) {
                this.qrName.getComponent(cc.Label).string = '实名: '+cc.dm.user.paymentName;
            } else {
                this.qrName.getComponent(cc.Label).string = '实名: 未填写';
            }
        } else {
            this.qrNode.active = false;
        }
    },

    onOkBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (!!this.editBox.string) {
            let score = parseInt(this.editBox.string);
            score *= 10000;
            score -= score%10000;
            if (score < this._minscore) {
                cc.utils.openTips('转存数量不能少于'+cc.utils.getScoreStr(this._minscore));
                return;
            }

            if (score*1.02 > cc.dm.user.score) {
                cc.utils.openTips('转存及手续金币不能超过所拥有金币数');
                cc.vv.audioMgr.playButtonSound();
                return;
            }

            cc.connect.withdrawScore(score, (res) => {
                this.checkScore(score);
            }, (errmsg) => {
                this.checkErrmsg(errmsg);
            });
        } else {
            cc.utils.openTips('请输入转存数量');
        }
    },

    checkScore(score) {
        let self = this;
        cc.dm.user.score -= score*(1.02);
        if (cc.sceneName == 'club' && !!cc.sceneSrc) {
            cc.sceneSrc.scoreChanged();
        }
        let tipstr = '转存成功\n\n转存金币: '+cc.utils.getScoreStr(score)+'    手续金币: '+cc.utils.getScoreStr(score*0.02);
        cc.utils.openTips(tipstr, function () {
            self.node.active = false;
        });
    },

    checkErrmsg(errmsg) {
        cc.utils.openTips(errmsg, function () {
            cc.utils.openMyInfo();
        });
    },

    onEditBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        cc.utils.openUpPayQRCode(cc.dm.user.paymentUrl, cc.dm.user.paymentName, () => {
            self.checkQR();
        });
    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }

    // update (dt) {},
});
