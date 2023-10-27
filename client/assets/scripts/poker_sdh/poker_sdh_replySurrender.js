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

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {

    },

    reset() {
        this.node.active = false;
    },

    showReplySurrender(cb) {
        this.node.active = true;
        this._cb  = cb;
    },

    agreeBtnPressed(event, data) {
        !!this._cb && this._cb(1);
    },

    refuseBtnPressed(event, data) {
        !!this._cb && this._cb(0);
    },
});
