cc.Class({
    extends: cc.Component,

    properties: {
        nameEditBox: {
            default: null,
            type: cc.EditBox,
        },

        oriLab: {
            default: null,
            type: cc.Label
        },
    },

    onLoad: function () {
        cc.utils.setNodeWinSize(this.node.getChildByName('layout'));
    },

    openEditRoomName (name, cb) {
        this.node.active = true;
        this._cb = cb;
        this._cid = cc.dm.clubInfo.cid;
        this._oriName = name;
        this.oriLab.string = this._oriName;
    },

    onCloseClick: function () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    onOkClick: function () {
        cc.vv.audioMgr.playButtonSound();
        let name = this.nameEditBox.string;
        if (!name) {
            name = '';
        }
        if (name.length > 32) {
            return cc.utils.openTips("规则名字太长。");
        }

        this.node.active = false;
        !!this._cb && this._cb(name);
    },
});
