cc.Class({
    extends: cc.Component,

    properties: {
        nameEditBox: {
            default: null,
            type: cc.EditBox,
            displayName: "名字输入框"
        }
    },

    onLoad: function () {
        cc.utils.setNodeWinSize(this.node.getChildByName('layout'));
    },

    open (createCB) {
        this._createCB = createCB;
    },

    onCloseClick: function () {
        this.node.active = false;
    },

    onCreateClick: function () {
        let name = this.nameEditBox.string;
        if (!name) {
            return cc.utils.openTips("亲友群名字不能为空。");
        }

        if (name.length < 2) {
            return cc.utils.openTips("亲友群名字太短");
        }

        if (name.length > 8) {
            return cc.utils.openTips("亲友群名字太长");
        }

        this.createClub(name);
    },

    createClub: function (name) {
        let self = this;
        cc.connect.createClub(name, (msg) => {
            if (self._createCB) {
                self._createCB();
            }
        });
    }
});
