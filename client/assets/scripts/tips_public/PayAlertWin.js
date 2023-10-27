cc.Class({
    extends: cc.Component,

    properties: {

    },
    
    onLoad: function () {
        cc.utils.setNodeWinSize(this.node);
    },

    onDisable:function(){

    },

    /**
     * 显示
     */
    show:function(cb) {
        this._cb = cb;
    },

    onOkClick:function(){
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
        !!this._cb && this._cb();
    },

    onCancelClick:function(){
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onDestroy() {

    },
});
