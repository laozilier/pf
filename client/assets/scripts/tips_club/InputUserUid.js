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

    openInputUserUid (cb) {
        this.node.active = true;
        this._cb = cb;
    },

    onCloseClick: function () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onOkClick: function () {
        cc.vv.audioMgr.playButtonSound();
        let uid = this.editBox.string;
        if (!uid) {
            return cc.utils.openTips("用户ID不能为空");
        }
        if (uid.length != 6) {
            return cc.utils.openTips("用户ID为6位数字");
        }

        this.node.active = false;
        !!this._cb && this._cb(uid);
    },
});
