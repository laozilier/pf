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
        nius: {
            default: [],
            type: cc.SpriteFrame
        },

        jinpainius: {
            default: [],
            type: cc.SpriteFrame
        },
        ahnius: {
            default: [],
            type: cc.SpriteFrame
        },

        ahjinpainius: {
            default: [],
            type: cc.SpriteFrame
        },

    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start () {

    },

    showValue (value, jinpai, isAnhui) {
        isAnhui || (isAnhui = 0);
        if(isAnhui == 0){
            if (!!jinpai) {
                this.node.getComponent(cc.Sprite).spriteFrame = this.jinpainius[value];
            } else {
                this.node.getComponent(cc.Sprite).spriteFrame = this.nius[value];
            }
        }else if(isAnhui == 1){
            if (!!jinpai) {
                this.node.getComponent(cc.Sprite).spriteFrame = this.ahjinpainius[value];
            } else {
                this.node.getComponent(cc.Sprite).spriteFrame = this.ahnius[value];
            }
        }
    },

    // update (dt) {},
});
