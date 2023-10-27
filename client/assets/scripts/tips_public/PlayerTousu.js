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
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onsubmitBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        if (!!this.editBox.string) {
            let str = this.editBox.string;
            let type = 0;
            cc.connect.complaint(type, str, function (res) {
                cc.utils.openTips('提交成功');
                this.node.active = false;
            }.bind(this));
        } else {
            cc.utils.openWeakTips('请输入内容');
        }
    },

    // update (dt) {},
});
