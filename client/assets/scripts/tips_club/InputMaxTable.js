cc.Class({
    extends: cc.Component,

    properties: {
        editBox: {
            default: null,
            type: cc.EditBox,
        },
    },

    onLoad: function () {
        cc.utils.setNodeWinSize(this.node.getChildByName('layout'));
    },

    openInputMaxTable (cb) {
        this.node.active = true;
        this._cb = cb;
    },

    onCloseClick: function () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onOkClick: function () {
        cc.vv.audioMgr.playButtonSound();
        let max = this.editBox.string;
        if (!max) {
            return cc.utils.openTips("开桌数不能为空");
        }

        this.node.active = false;
        !!this._cb && this._cb(parseInt(max));
    },
});
