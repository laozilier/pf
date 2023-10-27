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
        qrNode1:{
            default:null,
            type:cc.Node
        },

        headNode1:{
            default:null,
            type:cc.Node
        },

        shareNode:{
            default:null,
            type:cc.Node
        },

        myCodeLab1:{
            default:null,
            type:cc.Label,
        },

        _can: false,
        _url: null,
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);

        let str = ''+cc.dm.user.uid;
        this.myCodeLab1.string = str;
        this.myCodeLab1.node.getChildByName('Label').getComponent(cc.Label).string = str;
    },

    onSharedWeixin:function (){
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openWeakTips('请用手机截图保存后通过微信分享');
        //cc.utils.openShareTypeWin(this.shareNode);
    },

    start () {
        //this.schdulePageView();
    },

    onEnable () {
        this.headNode1.getComponent('superSprite').loadUrl(cc.dm.user.headimg);
        cc.connect.inviteUrl((url) => {
            this.setQRPic(url);
        });
    },

    onDisable () {
        this._can = false;
    },

    setQRPic (url) {
        this._url = url;
        let qrcode = new QRCode(-1, QRErrorCorrectLevel.H);
        qrcode.addData(url);
        qrcode.make();

        let ctx = this.qrNode1.getComponent(cc.Graphics);
        ctx.clear();
        ctx.fillColor = cc.Color.BLACK;
        // compute tileW/tileH based on node width and height
        let tileW = this.qrNode1.width / qrcode.getModuleCount();
        let tileH = this.qrNode1.height / qrcode.getModuleCount();

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

        //this.qrNode2.spriteFrame = this.qrNode1.spriteFrame;
    },

    onClose:function () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

});
