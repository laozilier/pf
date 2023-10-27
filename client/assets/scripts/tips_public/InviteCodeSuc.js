cc.Class({
    extends: cc.Component,

    properties: {
        bindLab: {
            default: null,
            type: cc.Label
        }
    },

    // use this for initialization
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
    },

    onEnable:function(){

    },

    onDisable (){

    },

    open(code, cb) {
        this._cb = cb;
        this.bindLab.string = '您已成功绑定邀请码:'+code;
    },

    onCloseClicked:function(){
        cc.vv.audioMgr.playButtonSound();
        !!this._cb && this._cb();
        this.node.active = false;

    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
