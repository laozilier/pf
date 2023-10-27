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
        ruleLab: {
            default: null,
            type: cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {
        let str = cc.enum.playRules[cc.enum.GameName.niuniu_mpqz];
        this.ruleLab.string = str;
        this.ruleLab.node.getChildByName('Label').getComponent(cc.Label).string = str;
    },

    // update (dt) {},
    onItemTogglePressed(event, data) {
        let str = cc.enum.playRules[data];
        this.ruleLab.string = str;
        this.ruleLab.node.getChildByName('Label').getComponent(cc.Label).string = str;
    },

    // 关闭
    bntClose: function () {
        this.node.active = false;
        cc.vv.audioMgr.playButtonSound();
    },
});
