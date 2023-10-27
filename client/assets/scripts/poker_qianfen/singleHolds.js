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
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this.pokersNode = this.node.getChildByName('pokersNode');
        this.zhanum = this.node.getChildByName('zhanum');
        this.zhanumLab = this.zhanum.getChildByName('zhanumLab');
        for (let i = 0; i < 12; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            this.pokersNode.addChild(poker, i, 'poker'+(11-i));      
        }
    },

    start () {

    },

    reset() {
        if (!this.node.active) {
            return;
        }

        this.zhanum.active = false;
        this.pokersNode.children.forEach(el => {
            el.active = false;
        });

        this.node.active = false;
    },

    /**
     * 设置数据
     * @param {*} cards 
     */
    checkSingleHolds(cards, time) {
        this.node.active = true;
        this.pokersNode.getComponent(cc.Layout).spacingY = cards.length > 3 ? -288 : -222;
        this.zhanum.active = cards.length > 3;
        this.zhanumLab.getComponent(cc.Label).string = cards.length+'I';
        for (let i = 0; i < 12; i++) {
            let el = this.pokersNode.getChildByName('poker'+i);
            if (i < cards.length) {
                let scr = el.getComponent('poker');
                scr.show(cards[i]);
                scr.setCanThrow(true);
                scr.setSelected(false);
                scr.setColorTiqi(false);
                if (typeof time == 'number') {
                    el.opacity = 1;
                    setTimeout(() => {
                        el.opacity = 255;
                    }, time*85);
                }
            } else {
                el.active = false;
            }
        }

        this.isZhadan = cards.length > 3;
        if (this.zhanum.active && typeof time == 'number') {
            this.zhanum.opacity = 1;
            setTimeout(() => {
                this.zhanum.opacity = 255;
            }, time*80);
        }
    },

    getHoldsPositons(args) {
        let ends = [];
        this.pokersNode.children.forEach((poker, idx) => {
            if (poker.active) {
                let end = poker.getNodeToWorldTransformAR();
                end = cc.p(end.tx, end.ty);
                ends.push({p: end, v: poker.getComponent('poker').getValue()});
                if (!!args && args.p == undefined) {
                    let poker_scr = poker.getComponent('poker');
                    if (poker_scr.getValue() == args.v) {
                        args.p = end;
                    }
                }
            }
        });

        return ends;
    }, 

    checkCanThrow(nots) {
        this.pokersNode.children.forEach((el, idx) => {
            if (el.active) {
                let scr = el.getComponent('poker');
                let v = scr.getValue();
                if (nots.includes(v)) {
                    scr.setCanThrow(false);
                }
            }
        });
    },

    checkTiqi(cards) {
        cards = [].concat(cards);
        this.pokersNode.children.forEach((el, idx) => {
            if (el.active) {
                let scr = el.getComponent('poker');
                let v = scr.getValue();
                if (cards.includes(v)) {
                    scr.setColorTiqi(true);
                    cards.splice(cards.indexOf(v), 1);
                } else {
                    scr.setColorTiqi(false);
                }
            }
        });
    },

    resetStatus() {
        this.pokersNode.children.forEach((el, idx) => {
            if (el.active) {
                let scr = el.getComponent('poker');
                scr.setCanThrow(true);
                scr.setSelected(false);
                scr.setColorTiqi(false);
            }
        });
    },

    checkTouchStart(startp) {
        let p = this.node.convertToNodeSpaceAR(startp);
        this.startp = p;
        let touched = false;
        for (let i = 0; i < 12; i++) {
            let poker = this.pokersNode.getChildByName('poker'+i);
            let scr = poker.getComponent('poker');
            if (poker.active && scr.canThrow && poker.getBoundingBox().contains(p)) {
                scr.setSelected(true);
                touched = true;
                break;
            }
        }

        if (touched && this.isZhadan) {
            for (let i = 0; i < 12; i++) {
                let poker = this.pokersNode.getChildByName('poker'+i);
                let scr = poker.getComponent('poker');
                if (poker.active && scr.canThrow) {
                    scr.setSelected(true);
                }
            }
        }
    },

    checkTouchMove(endp) {
        endp = this.node.convertToNodeSpaceAR(endp);
        let rectx = this.startp.x > endp.x ? endp.x : this.startp.x;
        let recty = this.startp.y > endp.y ? endp.y : this.startp.y;
        let rectw = Math.abs(this.startp.x-endp.x);
        let recth = Math.abs(this.startp.y-endp.y);
        let frame = cc.rect(rectx, recty, rectw, recth);
        //intersects
        for (let i = 0; i < 12; i++) {
            let poker = this.pokersNode.getChildByName('poker'+i);
            let scr = poker.getComponent('poker');
            if (poker.active && scr.canThrow) {
                let bound = cc.rect(0, 0, 0, 0);
                if (this.isZhadan) {
                    bound = this.pokersNode.getBoundingBox();
                } else {
                    bound = poker.getBoundingBox();
                    if (i > 0) {
                        bound.y += 130;
                        bound.height -= 130;
                    }
                }

                if (frame.intersects(bound)) {
                    scr.setSelected(true);
                } else {
                    scr.setSelected(false);
                }
            }
        }
    },

    checkTouchEnd() {
        for (let i = 0; i < 12; i++) {
            let poker = this.pokersNode.getChildByName('poker'+i);
            let scr = poker.getComponent('poker');
            if (poker.active && scr.canThrow && scr.isSelected) {
                scr.setSelected(false);
                scr.setColorTiqi(!scr.isTiqi);
            }
        }
    },

    getTiqiList() {
        let cards = [];
        for (let i = 0; i < 12; i++) {
            let poker = this.pokersNode.getChildByName('poker'+i);
            let scr = poker.getComponent('poker');
            if (poker.active && scr.canThrow && scr.isTiqi) {
                cards.push(scr.getValue());
            }
        }

        return cards;
    },

    // update (dt) {},
});
