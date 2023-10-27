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
        tipsLab:{
            default: null,
            type:cc.Label
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    open(txt, loop) {
        if (typeof txt != 'string' || txt.length == 0) {
            return;
        }


        this.node.active = true;
        this._txt = txt;
        this._loop = loop;
        this.startAct();
    },

    startAct() {
        this.tipsLab.string = this._txt;
        this.tipsLab.node.stopAllActions();
        this.tipsLab.node.x = 450;

        let marginx = this._txt.length*20;
        let times = this._txt.length*0.15+6;
        let p = cc.p(-450-marginx, this.tipsLab.node.y);
        this.tipsLab.node.runAction(cc.sequence(cc.moveTo(times, p), cc.delayTime(5), cc.callFunc(this.nextAct.bind(this))));
    },

    nextAct() {
        if (this._loop) {
            this.startAct();
        } else {
            this.node.active = false;
        }
    }
    // update (dt) {},
});
