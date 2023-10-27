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
        actBtn: {
            default: null,
            type: cc.Node
        },

        noTipsNode: {
            default: null,
            type: cc.Node
        },

        noTipsLab: {
            default: null,
            type: cc.Label
        },

        peps: {
            default: null,
            type: cc.Node
        },

        inTipsNode: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    onEnable () {
        this._url = null;
        this.actBtn.active = false;
        this.noTipsNode.active = false;
        this.inTipsNode.active = false;
        this.checkActBtn(true);
    },

    checkActBtn(share) {
        this.actBtn.active = true;
        if (share) {
            this.noTipsNode.active = true;
            let inspr = this.actBtn.getChildByName('inspr');
            inspr.active = false;
            let sharespr = this.actBtn.getChildByName('sharespr');
            sharespr.active = true;
            let subordinateCount = cc.dm.user.subordinateCount;
            let c = 5-subordinateCount;
            c = Math.max(1, c);
            this.noTipsLab.string = c;
            this.noTipsLab.node.children.forEach(el => {
                el.getComponent(cc.Label).string = c;
            });
            this.peps.children.forEach((el, idx)=> {
                el.active = (idx < c);
            });
        } else {
            this.inTipsNode.active = true;
            let inspr = this.actBtn.getChildByName('inspr');
            inspr.active = true;
            let sharespr = this.actBtn.getChildByName('sharespr');
            sharespr.active = false;
        }
    },

    onInBtnPressed () {
        if (!!this._url) {
            cc.sys.openURL(this._url);
            this.oncloseBtnPressed();
        } else {
            this.onShareBtnPressed();
        }
    },

    onShareBtnPressed() {
        this.oncloseBtnPressed();
        cc.utils.openQCodeShare();
    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }

    // update (dt) {},
});
