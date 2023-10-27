cc.Class({
    extends: cc.Component,

    properties: {
        editBox: {
            default: null,
            type: cc.EditBox
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

    open (cb) {
        this._cb = cb;
        if (!!cc.dm.user.pid) {
            this.editBox.string = cc.dm.user.pid;
        }
    },
    
    onOkClicked:function() {
        cc.vv.audioMgr.playButtonSound();
        this.onInputFinished();
    },

    onInputFinished() {
        if (!!this.editBox.string && this.editBox.string.length == 6) {
            let pid = parseInt(this.editBox.string);
            if (pid == cc.dm.user.uid) {
                cc.utils.openErrorTips(10052);
                return;
            }

            cc.connect.bindParent(pid, () => {
                cc.dm.user.pid = pid;
                this.node.active = false;
                this.showSuc(pid);
            });
        } else {
            cc.utils.openTips('请输入正确的邀请码');
        }
    },

    showSuc(pid) {
        let inviteCodeSuc = cc.find("Canvas").getChildByName('inviteCodeSuc');
        if (inviteCodeSuc != undefined) {
            inviteCodeSuc.active = true;
            inviteCodeSuc.getComponent('InviteCodeSuc').open(pid, this._cb);
        } else {
            cc.utils.loadPrefabNode('tips_public/inviteCodeSuc', function (inviteCodeSuc) {
                cc.find("Canvas").addChild(inviteCodeSuc, 100, 'inviteCodeSuc');
                inviteCodeSuc.getComponent('InviteCodeSuc').open(pid, this._cb);
            }.bind(this));
        }
    },

    onCloseClicked:function(){
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    },

    // called every frame, uncomment this function to activate update callback
    // update: function (dt) {

    // },
});
