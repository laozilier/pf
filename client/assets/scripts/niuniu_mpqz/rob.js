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
        sprFrames: {
            default: [],
            type: cc.SpriteFrame
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    /**
     * 开始抢庄
     * @param {*} rob 
     */
    startRob(rob) {
        this.node.active = true;
        let bei = this.node.getChildByName('bei');
        let xNode = bei.getChildByName('xNode');
        let numNode = bei.getChildByName('numNode');
        numNode.getComponent(cc.Sprite).spriteFrame = this.sprFrames[rob];
        if (rob > 0) {
            xNode.active = true;
        } else {
            xNode.active = false;
        }
    },

    /**
     * 最终抢庄
     * @param {*} rob 
     */
    finalRob(rob) {

    },

    /**
     * 重置
     */
    reset() {
        this.node.active = false;
    },

    start () {

    },

    // update (dt) {},
});
