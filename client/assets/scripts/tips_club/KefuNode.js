cc.Class({
    extends: cc.Component,

    properties: {
        
    },

    onLoad: function () {
        cc.utils.setNodeWinSize(this.node.getChildByName('layout'));
    },

    openKefuNode () {
        this.node.active = true;
    },

    onCloseClick: function () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onCopyClick: function () {
        cc.vv.audioMgr.playButtonSound();
        nativeApi.copyInfo("13007413626");
    },
});
