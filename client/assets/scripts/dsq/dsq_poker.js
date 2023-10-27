// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let chess = require('dsq_enum');
cc.Class({
    extends: cc.Component,

    properties: {
        //牌面数组
        pokerSprite: {
            default: [],
            type: [cc.SpriteFrame]
        },
        pokerbg: {
            default: null,
            type: cc.SpriteFrame
        },
        pokerNode: {
            default: null,
            type: cc.Sprite
        },
        guang: {
            default: null,
            type: cc.Sprite
        },
        lastHand: {
            default: null,
            type: cc.Sprite
        },
        arrowArr: {
            default: [],
            type: [cc.Sprite]
        },
        arrowSprite: {
            default: [],
            type: [cc.SpriteFrame]
        }
    },

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    start() {

    },
    arrowArrIshaid(_bool) {
        for (let index = 0; index < 4; index++) {
            this.arrowArr[index].node.active = _bool;

        }

    },
    showArrow(arrowNum, index) {
        this.arrowArr[arrowNum].node.active = true;
        this.arrowArr[arrowNum].spriteFrame = this.arrowSprite[index];
    },
    getArrowArr() {
        return this.arrowArr;
    },
    show(value, isfanpai) {
        if (isfanpai) {
            this.node.runAction(cc.scaleTo(0.2, 1, 1));
        }
        this._value = value;
        this.node.active = true;
        if (value == null || value == -1) {
            this.pokerNode.spriteFrame = this.pokerbg;
        } else {
            if (value < 10) {
                this.pokerNode.spriteFrame = this.pokerSprite[value - 1];
            } else if (value > 10) {
                this.pokerNode.spriteFrame = this.pokerSprite[value - 3];
            }
        }
    },

    //设置位置
    setSeat(seat) {
        this._seat = seat;
    },

    //获取当前牌的位置
    getSeat() {
        return this._seat;
    },

    //获取当前的牌的值
    getValue() {

        return this._value;
    },

    //添加光效
    isGuangSetVisbe(_bool) {
        this.guang.node.active = _bool;
    },

    //显示上一手
    setLastHandHied(_bool) {
        this.lastHand.node.active = _bool;
    },

    // update (dt) {},

    //翻牌动画
    flopAnimationAction(value) {
        let self = this;
        let seq = cc.sequence(
            cc.scaleTo(0.2, 0, 1),
            cc.callFunc(function () {
                self.isGuangSetVisbe(false);
                self.setLastHandHied(true);
                self.show(value, true);
            })
        );
        this.node.runAction(seq);
    },
    //牌抖动动画
    jitterAnimation(pthg) {
        let self = this;
        let seq = cc.sequence(
            cc.moveBy(0.1, 5, 0),
            cc.moveBy(0.1, -5, 0),
            cc.moveBy(0.1, 5, 0),
            cc.moveBy(0.1, -5, 0),
            cc.moveBy(0.1, 5, 0),
            cc.moveBy(0.1, -5, 0),
            cc.scaleTo(0.2, 0, 1),
            cc.callFunc(function () {
                self.isGuangSetVisbe(false);
                pthg.cb(pthg.value);
            })
        );
        this.node.runAction(seq);
    },

    moveCardaction(pthg) {
        let self = this;
        this.node.zIndex = 600;
        let loction = chess.positionsArr[pthg.index];
        let action = cc.sequence(cc.moveTo(0.35, loction), cc.callFunc(function () {
            pthg.cb(pthg.index);
            self.node.zIndex = 0;
        }));
        this.node.runAction(action);
    }
});
