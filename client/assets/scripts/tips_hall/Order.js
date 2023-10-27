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
        content: {
            default: null,
            type: cc.Node
        },

        item: {
            default: null,
            type: cc.Node
        },

        loadingNode: {
            default: null,
            type: cc.Node
        },

        loadingLab: {
            default: null,
            type: cc.Label
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    open() {
        this.node.active = true;
        this.content.children.forEach((el) => {
            el.active = false;
        });
        this.loadingNode.active = true;
        this.loadingLab.node.active = false;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));
        let self = this;
        cc.connect.rechargeHistory((list) => {
            this.loadingNode.stopAllActions();
            this.loadingNode.active = false;
            if (!list || list.length == 0) {
                this.loadingLab.node.active = true;
                this.loadingLab.string = '暂无数据';
                return;
            }
            self.check(list);
        }, (errmsg) => {
            this.loadingLab.node.active = true;
            this.loadingLab.string = errmsg;
        });
    },

    check(list) {
        if (list == undefined || list.length == 0) {
            return;
        }

        for (let i = 0; i < list.length; i++) {
            let order = list[i];
            let item = this.content.getChildByName('item'+i);
            if (!item) {
                item = cc.instantiate(this.item);
                this.content.addChild(item, i, 'item'+i);
            }

            item.active = true;
            let idLab = item.getChildByName('idLab');
            if (!!idLab) {
                idLab.getComponent(cc.Label).string = order.order_sn;
            }

            let scoreLab = item.getChildByName('scoreLab');
            if (!!scoreLab) {
                scoreLab.getComponent(cc.Label).string = cc.utils.getScoreStr(order.pay_money*10000);
            }

            let typeLab = item.getChildByName('typeLab');
            if (!!typeLab) {
                let typestr = '其他';
                switch (order.pay_channel) {
                    case 0:
                        typestr = '微信支付';
                        break;
                    case 1:
                        typestr = '好哒支付';
                        break;
                    case 30:
                        typestr = '人工充值';
                        break;
                    case 40:
                        typestr = '代理积分兑换';
                        break;
                    default:
                        break;
                }
                typeLab.getComponent(cc.Label).string = typestr;
            }

            let timeLab = item.getChildByName('timeLab');
            if (!!timeLab) {
                //let date = new Date(order.pay_time);
                //let datestr = date.Format('yyyy-MM-dd hh:mm');
                let datestr = order.pay_time;
                datestr = datestr.replace('T', ' ');
                timeLab.getComponent(cc.Label).string = datestr.substr(0, 16);
            }
        }
    },

    start () {

    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }

    // update (dt) {},
});
