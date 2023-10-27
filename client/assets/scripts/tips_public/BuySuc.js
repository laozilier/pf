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
        scoreLab: {
            default: null,
            type: cc.Label
        },

        bg: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    onEnable () {
        this.bg.stopAllActions();
        this.bg.runAction(cc.repeatForever(cc.rotateBy(6, 360)));
    },

    onDisable () {
        this.bg.stopAllActions();
    },

    open (score) {
        let str = cc.utils.getScoreStr(score);
        this.scoreLab.string = str;
        this.scoreLab.node.getChildByName('Label').getComponent(cc.Label).string = str;
    },

    onClose () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    // update (dt) {},
});
