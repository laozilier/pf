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
        tipsLab: {
            default: null,
            type: cc.Node
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._time = 0;
        this._dians = ['...', '..', '.'];
    },

    start () {

    },

    
    reset() {
        this.unschedule(this.nextCheck);
        this.tipsLab.getComponent(cc.Label).string = '';
        this.node.active = false;
    },

    openTips(str, time=30, tipsy=90) {
        this.node.active = true;
        this.node.y = tipsy;
        if (typeof time == 'number') {
            this._time = time;
        }

        this._str = (str || '');
        this.tipsLab.getComponent(cc.Label).string = this.getStr();
        this.unschedule(this.nextCheck);
        this.schedule(this.nextCheck, 1);
    },

    getStr() {
        let str = this._str+this._dians[this._time%this._dians.length]+'  '+this._time;
        return str;
    },

    nextCheck() {
        if (this._time > 0) {
            this._time -= 1;
        }

        this.tipsLab.getComponent(cc.Label).string = this.getStr();
    }
    

    // update (dt) {},
});
