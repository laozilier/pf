cc.Class({
    extends: cc.Component,

    properties: {
        qrNode:{
            default:null,
            type:cc.Node,
            displayName:"二维码图片"
        },

        tipsLab:{
            default:null,
            type:cc.Node
        },

        shareBtn:{
            default:null,
            type:cc.Node
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

    show(url) {
        this._url = url;
        this.shareBtn.active = false;
        this.setQRNode();
    },

    setQRNode() {
        this.qrNode.active = false;
        if (!!this._url) {
            let str = '';
            let isWx = (this._url.indexOf('yaowk') > -1
                || this._url.indexOf('wxp://') > -1
                || this._url.indexOf('payapp.weixin.qq.com') > -1);
            if (isWx) {
                this.shareBtn.active = true;
                this.tipsLab.y = 36;
                str = '请使用另一台手机打开微信扫一扫支付。或者分享到微信识别二维码支付';
            } else {
                this.tipsLab.y = 0;
                str = '请用手机截图后使用支付宝扫一扫，从相册获取图片扫码支付。或者直接使用另一台手机打开支付宝扫一扫支付。';
            }

            this.tipsLab.getComponent(cc.Label).string = str;
            this.tipsLab.getChildByName('Label1').getComponent(cc.Label).string = str;
            this.tipsLab.getChildByName('Label2').getComponent(cc.Label).string = str;
            this.qrNode.active = true;
            this.scheduleOnce(function () {
                let qrcode = new QRCode(-1, QRErrorCorrectLevel.M);
                qrcode.addData(this._url);
                qrcode.make();
                let ctx = this.qrNode.getComponent(cc.Graphics);
                ctx.clear();
                ctx.fillColor = isWx ? cc.hexToColor('#3CAF36') : cc.hexToColor('#00A0E9');
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
        }
    },

    onShareBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        wxApi.shareImg(this.node, 0);
    },

    onCloseClicked:function() {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
