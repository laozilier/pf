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
        qrNode:{
            default:null,
            type:cc.Node
        },

        editBox:{
            default:null,
            type:cc.EditBox
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {
        //this.schdulePageView();
    },

    openBigQRCode(uid, url, name, cb) {
        this.node.active = true;
        this._url = url;
        this._uid = uid;
        this.editBox.string = name || '';
        this._cb = cb;
        this.setQRNode();
    },

    setQRNode() {
        if (!!this._url) {} else {
            return;
        }
        let isAli = (this._url.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || this._url.indexOf('https://qr.alipay.com/') > -1);
        this.scheduleOnce(function () {
            let qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
            qrcode.addData(this._url);
            qrcode.make();
            let ctx = this.qrNode.getComponent(cc.Graphics);
            ctx.clear();
            ctx.fillColor = isAli ? cc.hexToColor('#00A0E9') : cc.hexToColor('#3CAF36');
            // compute tileW/tileH based on node width and height
            let tileW = this.qrNode.width / qrcode.getModuleCount();
            let tileH = this.qrNode.height / qrcode.getModuleCount();

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
    },

    onOkBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        if (!!self._url) {
            /*
            let name = this.editBox.string;
            if (!name) {
                cc.utils.openTips('请输入正确的实名信息');
                return;
            }
            */
            cc.connect.managerSavePaymentCode(self._uid, self._url, 'realname', function (res) {
                !!self._cb && self._cb(self._url, name);
            });

            self.node.active = false;
        } else {
            cc.utils.openTips('未获取到正确的二维码，请确认');
        }
    },

    onEditBtnPressed:function () {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        nativeApi.getQRCode(function (url) {
            if (self._url == url) {
                return;
            }
            let isAli = (url.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || url.indexOf('https://qr.alipay.com/') > -1);
            if (isAli) {
                self._url = url;
                self.setQRNode();
            } else {
                cc.utils.openWeakTips('请上传正确的二维码');
            }
        });
    },

    onClose:function () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

});
