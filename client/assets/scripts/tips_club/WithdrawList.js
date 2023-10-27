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

    openWithdrawList() {
        this.node.active = true;
        this.content.children.forEach((el) => {
            el.active = false;
        });
        this.loadingNode.active = true;
        this.loadingLab.node.active = false;
        this.loadingNode.runAction(cc.repeatForever(cc.rotateBy(0.8, 360)));

        let self = this;
        cc.connect.playerWithdrawHistory((list) => {
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
            let scoreLab = item.getChildByName('scoreLab');
            if (!!scoreLab) {
                scoreLab.getComponent(cc.Label).string = cc.utils.getScoreStr(order.score);
            }

            let statusLab = item.getChildByName('statusLab');
            if (!!statusLab) {
                statusLab.getComponent(cc.Label).string = this.getStatusStr(order.status);
            }
            /*
            let remarkLab = item.getChildByName('remarkLab');
            if (!!remarkLab) {
                let payment_no = order.payment_no;
                let remark = order.remark;
                if (!!remark) {
                    remarkLab.getComponent(cc.Label).string = remark;
                } else {
                    if (order.status == 1) {
                        if (!!payment_no) {
                            remarkLab.getComponent(cc.Label).string = '请查看微信零钱';
                        } else {
                            remarkLab.getComponent(cc.Label).string = '请查看支付宝';
                        }
                    } else {
                        remarkLab.getComponent(cc.Label).string = '';
                    }
                } 
            }
            */
            let timeLab = item.getChildByName('timeLab');
            if (!!timeLab) {
                let datestr = order.create_time;
                datestr = datestr.replace('T', ' ');
                timeLab.getComponent(cc.Label).string = datestr.substr(0, 16);
            }
        }
    },

    getStatusStr(status) {
        let str = '';
        switch (status) {
            case 0:
                str = '待处理';
                break;
            case 1:
                str = '已同意';
                break;
            case 2:
                str = '已拒绝';
                break;
            default:
                break;
        }

        return str;
    },

    start () {

    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }

    // update (dt) {},
});
