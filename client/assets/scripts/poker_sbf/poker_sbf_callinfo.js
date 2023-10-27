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
        frames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.zhuType = this.node.getChildByName('zhuType');
    },

    reset() {
        this.zhuType.active = false;
    },

    checkZhuType(zhuType) {
        this.zhuType.active = true;
        if (zhuType < 0) {
            this.zhuType.getComponent(cc.Sprite).spriteFrame = this.frames[4];
        } else {
            this.zhuType.getComponent(cc.Sprite).spriteFrame = this.frames[zhuType];
        }
    },

    start () {

    },

    // update (dt) {},
});
