let c = {
    extends:cc.Component,
    properties:{
        headNode: {
            default: null,
            type: cc.Node,
        },

        nameLab:{
            default:null,
            type:cc.Label
        },

        ID:{
            default:null,
            type:cc.Label
        },

        bindCode:{
            default:null,
            type:cc.Label
        },

        inviteCode:{
            default:null,
            type:cc.Label
        },

        createTime:{
            default:null,
            type:cc.Label
        },

        wechatNotips: {
            default:null,
            type:cc.Node
        },

        wechatInfo: {
            default:null,
            type:cc.Node
        },

        mobileNotips: {
            default:null,
            type:cc.Node
        },

        mobileInfo: {
            default:null,
            type:cc.Node
        },

        mobileLab: {
            default:null,
            type:cc.Node
        },

        mobileInput:{
            default:null,
            type:cc.EditBox
        },

        codeInput:{
            default:null,
            type:cc.EditBox
        },

        codeBtn:{
            default:null,
            type:cc.Button
        },

        qrNotips: {
            default:null,
            type:cc.Node
        },

        qrInfo: {
            default:null,
            type:cc.Node
        },

        qrMa: {
            default:null,
            type:cc.Node
        },

        qrName: {
            default:null,
            type:cc.Node
        }
    }
};

c.onLoad = function(){
    cc.utils.setNodeWinSize(this.node);
};

c.onEnable = function () {

};

/**
 * 显示用户信息
 * @param info 用户信息
 * <ul>
 *     <li> sex 性别
 *     <li> name 名字
 *     <li> address locLab
 *     <li> inning  局数
 *     <li> uid    uid
 *     <li> ip
 *     <li> createTime
 * @param isGame 是否显示表情
 */
c.show = function() {
    //y = 150 w = 250
    //显示
    // uid = 190513;
    this.node.active = true;
    let province = "未知位置";
    let address = cc.utils.getAddrStr();
    if(address && address.province){
        province = address.province;
    }
    if(address && address.city){
        province += address.city;
    }

    this.nameLab.string = cc.dm.user.shortname;

    this.ID.string = 'ID: '+cc.dm.user.uid;

    this.bindCode.string = '我绑定的邀请码: '+(cc.dm.user.pid || '未绑定邀请码');

    this.inviteCode.string = '我的邀请码: '+cc.dm.user.uid;

    let timestr = cc.dm.user.createTime.replace('T', ' ');
    timestr = timestr.substr(0, 16);
    this.createTime.string = '创建时间: '+timestr;

    this.headNode.getComponent('HeadNode').updateData();

    this.checkWechat();
    this.checkMobile();
    this.checkQR();
};

c.onClose = function(){
    cc.vv.audioMgr.playButtonSound();
    this.node.active = false;
};

c.checkWechat = function () {
    let wechat = cc.dm.user.weChat;
    // && !!wechat.realname
    if (!!wechat && (!!wechat.headimg || !!wechat.realname || !!wechat.nickname)) {
        this.wechatNotips.active = false;
        this.wechatInfo.active = true;

        let headNode = this.wechatInfo.getChildByName('headNode');
        headNode.getComponent('HeadNode').updateData(wechat.headimg);

        let nicknameLab = this.wechatInfo.getChildByName('nickname');
        nicknameLab.getComponent(cc.Label).string = '微信昵称: '+wechat.nickname;

        let realnameLab = this.wechatInfo.getChildByName('realname');
        realnameLab.getComponent(cc.Label).string = '微信实名: '+wechat.realname;
    } else {
        this.wechatNotips.active = true;
        this.wechatInfo.active = false;
    }
};
c.onBindWechatPressed = function() {
    cc.vv.audioMgr.playButtonSound();
    cc.utils.openWeakTips('敬请期待');
    // cc.connect.bindWithdrawWechat((url) => {
    //     this.nextBindWX(url);
    // });
};

/***
 * 修改绑定微信第二步
 */
c.nextBindWX = function(url) {
    let bindWXNode = this.node.getChildByName('bindWXNode');
    if (bindWXNode) {
        bindWXNode.getComponent('BindWXNode').openBindWX(url);
    } else {
        cc.utils.loadPrefabNode('tips_hall/bindWXNode', function (bindWXNode) {
            this.node.addChild(bindWXNode, 1, 'bindWXNode');
            bindWXNode.getComponent('BindWXNode').openBindWX(url);
        }.bind(this));
    }        
};

c.checkMobile = function () {
    if (!!cc.dm.user.mobile) {
        this.mobileInfo.active = true;
        this.mobileNotips.active = false;
        this.mobileLab.getComponent(cc.Label).string = cc.dm.user.mobile;
        this.mobileLab.getChildByName('Lab').getComponent(cc.Label).string = cc.dm.user.mobile;
    } else {
        this.mobileInfo.active = false;
        this.mobileNotips.active = true;
    }
};

c.onMobileEditPressed = function () {
    cc.vv.audioMgr.playButtonSound();
    this.mobileInfo.active = false;
    this.mobileNotips.active = true;
};

c.onMobileBindPressed = function () {
    cc.vv.audioMgr.playButtonSound();
    cc.utils.openWeakTips('敬请期待');
    // if (!!this.mobileInput.string) {} else { 
    //     cc.utils.openWeakTips('请输入正确的手机号码');
    //     return;
    // };

    // if (!!this.codeInput.string) {} else { 
    //     cc.utils.openWeakTips('请输入正确的验证码');
    //     return;
    // };

    // let self = this;
    // cc.connect.bindMobile(this.mobileInput.string, this.codeInput.string, function (res) {
    //     self.checkMobile();
    // });
};

c.onCodeBtnPressed = function (event) {
    cc.vv.audioMgr.playButtonSound();
    cc.utils.openWeakTips('敬请期待');
    // if (!!this.mobileInput.string) {} else { 
    //     cc.utils.openWeakTips('请输入正确的手机号码');
    //     return;
    // };

    // this.codeBtn.interactable = false;
    // this._time = 60;
    // if (!!this._checkTimeout) {
    //     clearTimeout(this._checkTimeout);
    // }

    // this.checkTime();
    // cc.connect.sendCaptcha(this.mobileInput.string);
};

c.checkTime = function () {
    let lab1 = this.codeBtn.node.getChildByName('txtLabel');
    let lab2 = lab1.getChildByName('Label1');
    let lab3 = lab1.getChildByName('Label2');
    
    let str = '';
    this._time -= 1;
    if (this._time <= 0) {
        str = '获取';
        this.codeBtn.interactable = true;
    } else {
        str = this._time+'s';
        this._checkTimeout = setTimeout(() => {
            this.checkTime();
        }, 1000)
    }

    lab1.getComponent(cc.Label).string = str;
    lab2.getComponent(cc.Label).string = str;
    lab3.getComponent(cc.Label).string = str;
};

c.checkQR = function () {
    let url = cc.dm.user.paymentUrl;
    let isAli = (url.indexOf('HTTPS://QR.ALIPAY.COM/') > -1 || url.indexOf('https://qr.alipay.com/') > -1);
    let isWx = (url.indexOf('wxp://') > -1 || url.indexOf('payapp.weixin.qq.com') > -1);
    if (!!url && (isAli || isWx)) {
        this.qrInfo.active = true;
        this.qrNotips.active = false;
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
        this.qrInfo.active = false;
        this.qrNotips.active = true;
    }
};

c.onUpBtnPressed = function() {
    cc.vv.audioMgr.playButtonSound();
    let self = this;
    cc.utils.openUpPayQRCode(cc.dm.user.paymentUrl, cc.dm.user.paymentName, () => {
        self.checkQR();
    });
};

cc.Class(c);
