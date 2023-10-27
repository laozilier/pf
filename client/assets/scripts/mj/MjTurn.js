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
        nodes: {
            default: [],
            type: cc.Node
        },

        lab: {
            default: null,
            type: cc.Label
        },

        turn: {
            default: null,
            type: cc.Node
        },

        sprsNode: {
            default: null,
            type: cc.Node
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    // update (dt) {},
    reset() {
        this.turn.stopAllActions();
        this.turn.active = false;
        this.sprsNode.active = false;
    },

    showTurn(seat, time) {
        this.node.active = true;
        this.sprsNode.active = true;
        this._time = time;
        this.lab.string = time;
        this.nodes.forEach((n, idx) => {
            n.stopAllActions();
            n.active = (idx == seat);
            if (n.active) {
                n.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.6, 155), cc.fadeTo(0.6, 255))));
            }
        });

        /*
        if (!this._rotations) {
            this._rotations = [0, -90, 180, 90];
        }
        this.turn.active = true;
        this.turn.stopAllActions();
        this.turn.rotation = this._rotations[seat];
        this.turn.runAction(cc.repeatForever(cc.sequence(cc.fadeTo(0.5, 0), cc.fadeTo(0.5, 255))));
        */

        if (!!this._timeOut) {
            clearTimeout(this._timeOut);
        }

        this.nextTime();
    },

    nextTime() {
        this._timeOut = setTimeout(()=> {
            this._time -= 1;
            if (this._time < 0) {
                this._time = 0;
            }
            if (!!this.lab) {
                this.lab.string = this._time;
            }
            this.nextTime();
        }, 1000);
    },
});
