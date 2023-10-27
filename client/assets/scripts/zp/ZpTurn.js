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
        turnNode: {
            default: null,
            type: cc.Node
        },

        turnSpr: {
            default: null,
            type: cc.Node
        },

        turnBar: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._rotations = [90, 0, 180];
        this.reset();
    },

    start () {

    },

    reset() {
        this.unscheduleAllCallbacks();
        this.turnNode.active = false;
        this.turnBar.active = false;
        this._totalTime = 1;
        this._time = 1;
    },

    showTurn(localSeat, time=30) {
        this.turnNode.active = true;
        this.turnNode.stopAllActions();
        this.turnSpr.stopAllActions();
        if (localSeat > -1) {
            this.turnNode.runAction(cc.rotateTo(0.3, this._rotations[localSeat]));
            this.turnSpr.active = true;
            this.turnSpr.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.6, 90), cc.fadeTo(0.6, 255))));
        } else {
            this.turnSpr.active = false;
        }
        
        this._totalTime = time;
        this._time = time;
        this.turnBar.active = true;
        this.turnBar.getComponent(cc.ProgressBar).progress = 1;
        this.unscheduleAllCallbacks();
        this.schedule(this.scheduleBar, 0.01);
    },

    scheduleBar() {
        if (this._time > 0) {
            this._time -= 0.02;
        } else {
            this.unscheduleAllCallbacks();
            return;
        }

        this.turnBar.getComponent(cc.ProgressBar).progress = (this._time/this._totalTime);
    }

    // update (dt) {},
});
