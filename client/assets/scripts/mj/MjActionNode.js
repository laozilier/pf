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
        },

        huFrames: {
            default: [],
            type: cc.SpriteFrame
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        
    },

    start () {

    },

    reset() {
        this.node.stopAllActions();
        this.node.active = false;
    },

    inPoker(p, data, localSeat=0) {
        this.node.active = true;
        this.node.stopAllActions();
        if (localSeat == 0) {
            p.y+=36;
        } else if (localSeat == 1) {
            p.x-=24;
        } else if (localSeat ==2) {
            p.y-=12;
        } else {
            p.x+=24;
        }
        this.node.setPosition(p);
        let t = data.t;
        this.node.getComponent(cc.Sprite).spriteFrame = this.frames[t];
        this.node.opacity = 0;
        this.node.scale = 2;
        this.node.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.2, 0.8), cc.fadeTo(0.2, 255)),
            cc.scaleTo(0.1, 1.1),
            cc.scaleTo(0.1, 1),
            cc.delayTime(0.5),
            cc.fadeTo(0.3, 0)
        ));
    },

    actionHu(action_p, huType) {
        this.node.active = true;
        this.node.stopAllActions();
        this.node.setPosition(action_p);

        this.node.getComponent(cc.Sprite).spriteFrame = this.huFrames[huType];
        this.node.opacity = 0;
        this.node.scale = 2;
        this.node.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.2, 0.8), cc.fadeTo(0.2, 255)),
            cc.scaleTo(0.1, 1.1),
            cc.scaleTo(0.1, 1)
        ));
    },

    // update (dt) {},
});
