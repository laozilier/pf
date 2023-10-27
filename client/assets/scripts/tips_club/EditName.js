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

    open () {
        this._cid = cc.dm.clubInfo.cid;
        this._oriName = cc.utils.fromBase64(cc.dm.clubInfo.name);
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
            return cc.utils.openTips("亲友群名字不能为空。");
        }

        if (name.length > 8) {
            return cc.utils.openTips("亲友群名字太长。");
        }

        cc.connect.setName(cc.dm.clubInfo.cid, name, (msg) => {
            this.node.active = false;
        });
    },
});
