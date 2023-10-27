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
        shaizi1: {
            default: null,
            type: cc.Node
        },

        shaizi2: {
            default: null,
            type: cc.Node
        },

        node1: {
            default: null,
            type: cc.Node
        },

        node2: {
            default: null,
            type: cc.Node
        },

        frames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    startAction() {
        this.node.active = true;
        this.node1.active = false;
        this.node2.active = false;
        this.shaizi1.getComponent(cc.Animation).play('shaizi');
        this.shaizi2.getComponent(cc.Animation).play('shaizi2');
        let a = cc.utils.getRandom(0, 5);
        let b = cc.utils.getRandom(0, 5);
        this._timeOut = setTimeout(() => {
            this.node1.active = true;
            this.node2.active = true;
            this.node1.getComponent(cc.Sprite).spriteFrame = this.frames[a];
            this.node2.getComponent(cc.Sprite).spriteFrame = this.frames[b];
        }, 900);
    },

    reset() {
        if (!this.node.active) {
            return;
        }

        if (!!this._timeOut) {
            clearTimeout(this._timeOut);
            this._timeOut = undefined;
        }
        this.node1.active = false;
        this.node2.active = false;
        this.shaizi1.getComponent(cc.Animation).stop();
        this.shaizi2.getComponent(cc.Animation).stop();
        this.node.active = false;
    }

    // update (dt) {},
});
