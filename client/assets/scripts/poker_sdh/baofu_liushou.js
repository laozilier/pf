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
        this.baofuNode = this.node.getChildByName('baofu');
        this.liushouNode = this.node.getChildByName('liushou');
        this.typeNode = this.liushouNode.getChildByName('type');

        this.reset();
    },

    start () {

    },

    reset() {
        this.baofuNode.active = false;
        this.liushouNode.active = false;
        this.node.active = false;
    },

    checkData(data) {
        let baofu = data.baofu;
        if (!!baofu) {
            let type = data.liushou;
            if (typeof type == 'number') {
                this.liushou(type);
            } else {
                this.baofu();
            }
        }
    },

    baofu() {
        this.node.active = true;
        this.liushouNode.active = false;
        this.baofuNode.active = true;
        this.baofuNode.runAction(cc.blink(1.0, 3));
    },

    liushou(type) {
        this.node.active = true;
        this.baofuNode.stopAllActions();
        this.baofuNode.active = false;
        this.liushouNode.active = true;
        this.liushouNode.runAction(cc.blink(1.0, 3));
        this.typeNode.getComponent(cc.Sprite).spriteFrame = this.frames[type];
    }

    // update (dt) {},
});
