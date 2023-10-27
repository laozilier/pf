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
        descLab: cc.Label
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.utils.setNodeWinSize(this.node);
    },

    start () {
        this.onClick(null, '0');
    },

    onClick (event,customEventData) {
        if (event) {
            cc.vv.audioMgr.playButtonSound();
        }

        this.descLab.string = '';
        if(customEventData == '1') {
            // cc.connect.post('get_version', {}, function (res) {
            //     this.descLab.string = res;
            // }.bind(this));
            this.descLab.string = '\n       1.0.0版本更新内容：\n' +
                '       1、游戏全新上线，好玩的来啦！\n';
        } else {
            cc.connect.hallNotice((msg)=> {
                this.descLab.string = msg;
            }, (errmsg) => {
                this.descLab.string = '\n       '+errmsg;
            });
        }
    },

    oncloseBtnPressed () {
        cc.vv.audioMgr.playButtonSound();
        this.node.active = false;
    }
    // update (dt) {},
});
