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

    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    open(shareNode) {
        this._shareNode = shareNode;
    },

    onTimelinePressed() {
        cc.vv.audioMgr.playButtonSound();
        wxApi.shareImg(this._shareNode, 1);
    },

    onSessionPressed() {
        cc.vv.audioMgr.playButtonSound();
        wxApi.shareImg(this._shareNode, 0);
    },

    onClosePressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },
    // update (dt) {},
});
