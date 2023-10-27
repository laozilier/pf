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
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.sprs = this.node.getChildByName('sprs');
    },

    start () {

    },

    reset() {
        if (!this.node.active) {
            return;
        }
        this.unscheduleAllCallbacks();
        this.sprs.children.forEach(el => {
            el.stopAllActions();
            el.scale = 1;
            el.active = false;
        });
        this.tipsLab.active = false;
        this.node.active = false;
    },

    showTipsLine() {
        this.node.active = true;
        this.scheduleOnce(this.nextShowTipsLine, 1);
    },

    nextShowTipsLine() {
        this.tipsLab.active = true;
        this.sprs.children.forEach((el, idx) => {
            el.active = true;
            el.runAction(cc.repeatForever(cc.sequence(cc.delayTime(idx*0.1), cc.moveTo(0.1, cc.p(el.x, 4)), cc.moveTo(0.1, cc.p(el.x, 0)), cc.delayTime((this.sprs.children.length-idx)*0.1))));
        });
    }

    // update (dt) {},
});
