cc.Class({
    extends: cc.Component,

    properties: {
        qrbg:{
            default:null,
            type:cc.Node
        },

        qrNode:{
            default:null,
            type:cc.Node,
            displayName:"二维码图片"
        },

        tipsLab:{
            default:null,
            type:cc.Label
        },

        typesLab:{
            default:null,
            type:cc.Label
        },

        editBox:{
            default:null,
            type:cc.EditBox
        },
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
    },

    onEnable:function(){

    },

    onDisable (){

    },

    openUpPayQRCode(url, name, cb) {
        this.node.active = true;
        this._url = url || cc.dm.user.paymentUrl;
        this._name = name || cc.dm.user.paymentName;
        this.editBox.string = this._name || '';
        this._cb = cb;
        this.setQRNode();
    },

    setQRNode() {
        this.tipsLab.node.active = false;
        this.qrNode.active = false;
        this.qrbg.active = false;
        this.typesLab.node.active = false;
        let isAli = (this._url.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || this._url.indexOf('https://qr.alipay.com/') > -1);
        let isWx = (this._url.indexOf('wxp://') > -1 || this._url.indexOf('payapp.weixin.qq.com') > -1);
        if (!!this._url && (isAli || isWx)) {
            this.qrNode.active = true;
            this.qrbg.active = true;
            this.typesLab.node.active = true;
            this.scheduleOnce(function () {
                let qrcode = new QRCode(-1, QRErrorCorrectLevel.M);
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

                //let str = '请自行验证';
                //this.typesLab.string = str;
            }, 0.3);
        } else {
            this.tipsLab.node.active = true;
        }
    },

    onOkBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        if (!!self._url) {
            // let name = this.editBox.string;
            // if (!name) {
            //     cc.utils.openTips('请输入正确的实名信息');
            //     return;
            // }

            cc.connect.savePaymentCode(self._url, 'realname', function (res) {
                !!self._cb && self._cb();
            });

            self.node.active = false;
        } else {
            cc.utils.openTips('未获取到正确的二维码，请确认');
        }
    },

    onChangeBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        let self = this;
        nativeApi.getQRCode(function (url) {
            if (self._url == url) {
                return;
            }
            let isAli = (url.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || url.indexOf('https://qr.alipay.com/') > -1);
            let isWx = (url.indexOf('wxp://') > -1 || url.indexOf('payapp.weixin.qq.com') > -1);
            if (isAli || isWx) {
                self._url = url;
                self.setQRNode();
            } else {
                cc.utils.openWeakTips('请上传正确的二维码');
            }
        });
    },

    onCloseClicked:function(){
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
