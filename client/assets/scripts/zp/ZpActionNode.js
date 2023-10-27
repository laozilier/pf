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

        xhFrame: {
            default: null,
            type: cc.SpriteFrame
        },

        gxFrame: {
            default: null,
            type: cc.SpriteFrame
        },

        cjFrame: {
            default: null,
            type: cc.SpriteFrame
        },

        fanxingFrame: {
            default: null,
            type: cc.SpriteFrame
        },

        genxingFrame: {
            default: null,
            type: cc.SpriteFrame
        },

        ssFrame: {
            default: null,
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

    inPoker(p, data) {
        this.node.active = true;
        this.node.stopAllActions();
        this.node.setPosition(p);
        let t = data.t;
        if (t == cc.zp_chz_enum.inPokerType.chi) {
            let xh = data.xh;
            if (!!xh) {
                this.node.getComponent(cc.Sprite).spriteFrame = this.xhFrame;
            } else {
                this.node.getComponent(cc.Sprite).spriteFrame = this.frames[t];
            }
        } else if (t == cc.zp_chz_enum.inPokerType.xiao) {
            let g = data.g;
            if (!!g) {
                this.node.getComponent(cc.Sprite).spriteFrame = this.gxFrame;
            } else {
                this.node.getComponent(cc.Sprite).spriteFrame = this.frames[t];
            }
        } else if (t == cc.zp_chz_enum.inPokerType.jiao) {
            let c = data.c;
            if (!!c) {
                this.node.getComponent(cc.Sprite).spriteFrame = this.cjFrame;
            } else {
                this.node.getComponent(cc.Sprite).spriteFrame = this.frames[t];
            }
        } else {
            this.node.getComponent(cc.Sprite).spriteFrame = this.frames[t];
        }

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

    actionHu(p, data) {
        this.node.active = true;
        this.node.stopAllActions();
        this.node.setPosition(p);

        let t = data.huType;
        this.node.getComponent(cc.Sprite).spriteFrame = this.huFrames[t];
        this.node.opacity = 0;
        this.node.scale = 2;
        this.node.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.2, 0.8), cc.fadeTo(0.2, 255)),
            cc.scaleTo(0.1, 1.1),
            cc.scaleTo(0.1, 1)
        ));
    },

    fanxing(p, data) {
        this.node.active = true;
        let t = data.t;
        let finaly = p.y;
        if (t == 3) {
            this.node.getComponent(cc.Sprite).spriteFrame = this.genxingFrame;
        } else {
            this.node.getComponent(cc.Sprite).spriteFrame = this.fanxingFrame;
            finaly -= 100;
        }

        this.node.setPosition(cc.p(p.x, 1500));
        let a = cc.moveTo(0.3, cc.p(p.x, finaly-20));
        let b = cc.moveTo(0.1, cc.p(p.x, finaly+10));
        let c = cc.moveTo(0.1, cc.p(p.x, finaly));
        this.node.runAction(cc.sequence(a, b, c));
    },

    sishou(p) {
        this.node.active = true;
        this.node.stopAllActions();
        this.node.setPosition(p);

        this.node.getComponent(cc.Sprite).spriteFrame = this.ssFrame;
        this.node.opacity = 0;
        this.node.scale = 2;
        this.node.runAction(cc.sequence(
            cc.spawn(cc.scaleTo(0.2, 0.8), cc.fadeTo(0.2, 255)),
            cc.scaleTo(0.1, 1.1),
            cc.scaleTo(0.1, 1),
            cc.delayTime(1),
            cc.fadeTo(0.2, 0)
        ));
    }

    // update (dt) {},
});
