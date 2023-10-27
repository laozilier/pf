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
        leftContent:{
            default:null,
            type:cc.Node
        },

        itemContent:{
            default:null,
            type:cc.Node
        },

        itemNode:{
            default:null,
            type:cc.Node
        },

        propImgs: {
            default: [],
            type: cc.SpriteFrame
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad:function() {
        cc.utils.setNodeWinSize(this.node);
        this._items = [this.itemNode];
    },

    onClose:function (event) {
        if (!!event) {
            cc.vv.audioMgr.playButtonSound();
        }

        this.node.active = false;
        if (this._cb) {
            this._cb();
        }
    },

    onEnable () {

    },

    open (cb, buyid) {
        this._cb = cb;
        this._buyid = buyid;

        this._items.forEach(function (n) {
            n.active = false;
        });

        this._type = 0;
        this.leftContent.children.forEach((n, idx) => {
            n.getComponent(cc.Toggle).isChecked = (idx == 0);
        });
        this.updateList();
    },

    /***
     * 点击用户图像
     */
    onUserInfoPressed () {
        cc.vv.audioMgr.playButtonSound();
        cc.utils.openMyInfo();
    },

    updateList () {
        cc.connect.rechargeProp((list) => {
            this._props = list;
            this.checkItems();
        });
    },

    checkItems() {
        this._items.forEach(function (n) {
            n.active = false;
        });

        if (!!this._props) {} else { return; }
        let list = this._props.filter((obj) => {
            return obj.type == this._type;
        });

        for (let i = 0; i < list.length; i++) {
            let item = this._items[i];
            if (!!item) {} else {
                item = cc.instantiate(this.itemNode);
                this.itemContent.addChild(item);
                this._items.push(item);
            }

            item.active = true;
            let info = list[i];

            item.getChildByName('img').getComponent(cc.Sprite).spriteFrame = this.propImgs[i];
            let scoreStr = cc.utils.getScoreStr(info.count);
            let sLab = item.getChildByName('golds').getChildByName('scoreLab');
            sLab.getComponent(cc.Label).string = scoreStr;
            sLab.getChildByName('Label').getComponent(cc.Label).string = scoreStr;

            let priceStr = "";
            priceStr+= '¥ '+ Math.round(info.price)+'元';
            let priceLab = item.getChildByName('priceLab');
            priceLab.getComponent(cc.Label).string = priceStr;
            priceLab.getChildByName('Label').getComponent(cc.Label).string = priceStr;

            item.getComponent(cc.Button).clickEvents = [];
            cc.utils.addClickEvent(item, this, 'Store', 'onItemBtnPressed', info);

            let tuijianLab = item.getChildByName('tuijianLab');
            tuijianLab.active = false;
            if (!!this._buyid) {
                if (this._buyid == info.id) {
                    tuijianLab.active = true;
                }
            }
        }
    },

    onOpenTousu:function (){
        cc.vv.audioMgr.playButtonSound();
        cc.sys.openURL('https://tb.53kf.com/code/qrcode/aaafa0ff431fd251520c96a54cb0ad530/1');

        // let playerTousu = this.node.getChildByName('playerTousu');
        // if (playerTousu) {
        //     playerTousu.active = true;
        // } else {
        //     cc.utils.loadPrefabNode('tips_public/playerTousu', function (playerTousu) {
        //         this.node.addChild(playerTousu, 99, 'playerTousu');
        //     }.bind(this));
        // }
    },

    onTogglePressed(event, type) {
        cc.vv.audioMgr.playButtonSound();
        this._type = type;
        this.checkItems();
        if (this._type == 30) {
            cc.utils.openTips('请返回等待约30秒至5分钟\n充值成功金币将会自动到账',  () => {
                this.onClose();
            });
            cc.sys.openURL('https://tb.53kf.com/code/qrcode/aaafa0ff431fd251520c96a54cb0ad530/1');
        }
    },

    onItemBtnPressed (event, data) {
        if (this._type == 30) {
            cc.utils.openTips('请返回等待约30秒至5分钟\n充值成功金币将会自动到账',  () => {
                this.onClose();
            });
            cc.sys.openURL('https://tb.53kf.com/code/qrcode/aaafa0ff431fd251520c96a54cb0ad530/1');
        } else if (this._type == 0) {
            cc.utils.openLoading('正在购买...');
            cc.connect.interface('pay/joycenter/index.php', {id: data.id}, (res) => {
                let pay_page = '';
                let qr_code = '';
                let orderSn = '';
                if (typeof res == 'string') {
                    try {
                        res = JSON.parse(res);
                        pay_page = res.pay_page;
                        qr_code = res.qr_code;
                        orderSn = res.orderSn;
                    } catch (error) {
                        
                    }
                } else {
                    pay_page = res.pay_page;
                    qr_code = res.qr_code;
                    orderSn = res.orderSn;
                }
                
                cc.sys.localStorage.setItem('cc_dm_orderSn', orderSn || '');
                if (!!pay_page && !!qr_code) {
                    cc.utils.openTips('请耐心等待10秒~3分钟\n充值成功金币将会自动到账',  () => {
                        this.onClose();
                    });
                    cc.sys.openURL(pay_page);
                } else {
                    cc.utils.openTips('未获取到正确的支付地址，请稍后再试');
                }
            }, (errcode) => {
                cc.utils.openErrorTips(errcode);
            });
        }
    },

    // update (dt) {},
});
