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
        headSpr: {
            default: null,
            type: cc.Sprite,
        },

        maleSpr: {
            default: null,
            type: cc.Sprite,
        },

        femaleSpr: {
            default: null,
            type: cc.Sprite,
        },

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    onDestroy() {
        if (!!this._timeoutid) {
            clearTimeout(this._timeoutid);
        }
    },

    reset() {
        this.headSpr.getComponent("superSprite").loadUrl('');
        this.maleSpr.node.active = false;
        this.femaleSpr.node.active = false;
    },

    updateData (url, sex, time) {
        if (url != undefined || sex != undefined) {

        } else {
            url = cc.dm.user.headimg || '';
            sex = cc.dm.user.sex || 1;
        }

        if (this._url == url || url.length == 0) {
            return 0;
        }

        this._loading = true;
        this._url = url;
        //更新头象
        let self = this;
        if (time == undefined) {
            self.headSpr.getComponent("superSprite").loadUrl(url);
        } else {
            this._timeoutid = setTimeout(function () {
                self.headSpr.getComponent("superSprite").loadUrl(url);
            }, time*1000);
        }

        //性别
        if(sex === 2) {
            this.maleSpr.node.active = false;
            this.femaleSpr.node.active = true;
        } else if (sex === 1) {
            this.maleSpr.node.active = true;
            this.femaleSpr.node.active = false;
        } else {
            this.maleSpr.node.active = false;
            this.femaleSpr.node.active = false;
        }

        return 1;
    },

    // update (dt) {},
});
