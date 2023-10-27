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
        timeLab: {
            default: null,
            type: cc.Node
        },

        tipsLab: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._dians = ['.', '..', '...'];
        this._time = 0;
    },

    start () {

    },

    reset() {
        if (!this.node.active) {
            return;
        }

        this.unscheduleAllCallbacks();
        this.timeLab.getComponent(cc.Label).string = '';
        this.tipsLab.getComponent(cc.Label).string = '';
    },

    openZpTips(str, time) {
        this.node.active = true;
        if (typeof time == 'number') {
            this._time = time;
        }

        this._str = str;
        this._idx = 0;
        this.timeLab.getComponent(cc.Label).string = this._time;
        this.tipsLab.getComponent(cc.Label).string = str+'.';
        this.schedule(this.nextCheck, 1);
    },

    nextCheck() {
        this._idx+=1;
        if (this._idx >= this._dians.length) {
            this._idx = 0;
        }

        if (this._time > 0) {
            this._time -= 1;
        }

        this.timeLab.getComponent(cc.Label).string = this._time;
        this.tipsLab.getComponent(cc.Label).string = this._str+this._dians[this._idx];
    }

    // update (dt) {},
});
