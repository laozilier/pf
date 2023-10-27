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
        this.pokers = [];
        for (let i = 0; i < 9; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            poker.y = 0;
            this.node.addChild(poker, i, 'poker'+i);
            this.pokers.push(poker);
        }

        this.reset();
    },

    start () {

    },

    reset() {
        this.node.children.forEach(el => {
            el.stopAllActions();
            el.active = false;
        });
    },

    showBottomCards(len) {
        this.node.y = 108;
        for (let i = 0; i < this.pokers.length; i++) {
            let poker = this.node.getChildByName('poker'+i);
            if (i < len) {
                poker.getComponent('poker').show();
                poker.stopAllActions();
                poker.scale = 0.72;
            } else {
                poker.active = false;
            }
        }
    },

    showGetBottomCards(len, end) {
        this.node.y = 108;
        for (let i = 0; i < this.pokers.length; i++) {
            let poker = this.node.getChildByName('poker'+i);
            if (i < len) {
                if (Array.isArray(end)) {
                    let obj = end[i];
                    let p = cc.p(0, 0);
                    if (!!obj && obj.p) {
                        p = this.node.convertToNodeSpaceAR(obj.p);
                    }
                    poker.getComponent('poker').endPos = p;
                    poker.getComponent('poker').send_tran_ani({end: p, v: obj.v, i: i, startScale: 0.72, endScale: 0.56, hide: true});
                } else {
                    poker.getComponent('poker').send_ani({end: this.node.convertToNodeSpaceAR(end), i: i, startScale: 0.72, endScale: 0.24});
                }
            } else {
                poker.active = false;
            }
        }
    },

    showMaidiBottomCards(len, start) {
        this.node.y = 54;
        for (let i = 0; i < this.pokers.length; i++) {
            let poker = this.node.getChildByName('poker'+i);
            if (i < len) {
                poker.getComponent('poker').show();
                poker.stopAllActions();
                let r = Math.random()*90;
                let s = 0.25;
                if (!!start) {
                    if (Array.isArray(start)) {
                        poker.scale = 0.72;
                        poker.rotation = 0;
                        let obj = start[i];
                        let p = cc.p(0, 0);
                        if (!!obj) {
                            p = this.node.convertToNodeSpaceAR(obj.p);
                        }
                        poker.setPosition(p);
                        poker.runAction(cc.spawn(
                            cc.moveTo(0.3, cc.p(0, 0)),
                            cc.scaleTo(0.3, s),
                            cc.rotateTo(0.3, r)
                        ));
                    } else {
                        poker.scale = s;
                        poker.rotation = 0;
                        poker.setPosition(this.node.convertToNodeSpaceAR(start));
                        poker.runAction(cc.spawn(
                            cc.moveTo(0.3, cc.p(0, 0)),
                            cc.scaleTo(0.3, s),
                            cc.rotateTo(0.3, r)
                        ));
                    }
                } else {
                    poker.setPosition(cc.p(0, 0));
                    poker.scale = s;
                    poker.rotation = r;
                }
            } else {
                poker.active = false;
            }
        }
    },

    showLiangdiBottomCards(data, alg) {
        let cards = data.bottomCards;
        let margin = 60;
        let endx = 0;
        if (cards.length%2 == 0) {
            endx = -cards.length/2*margin+margin/2;
        } else {
            endx = -Math.floor(cards.length/2)*margin;
        }
        
        for (let i = 0; i < this.pokers.length; i++) {
            let poker = this.pokers[i];
            if (i < cards.length) {
                let v = cards[i];
                poker.getComponent('poker').send_tran_ani({end: cc.p(endx, 0), i: i, v: v, endScale: 0.72});
                poker.rotation = 0;
                if (!!data.isKoudi) {
                    if (alg.getCardScore(v) > 0) {
                        setTimeout(() => {
                            poker.stopAllActions();
                            poker.runAction(cc.moveBy(0.3, cc.p(0, 20)));
                        }, 1000);
                    }
                }

                endx+=margin;
            } else {
                poker.active = false;
            }
        }
    },

    getLiangdiScoreCardsPosition(alg) {
        let starts = [];
        for (let i = 0; i < this.pokers.length; i++) {
            let poker = this.pokers[i];
            if (!poker.active) {
                continue;
            }

            let v = poker.getComponent('poker').getValue();
            if (alg.getCardScore(v) > 0) {
                let p = poker.getNodeToWorldTransformAR();
                p = cc.p(p.tx, p.ty);
                starts.push({p: p, v: v, s: 0.72});
            }
        }

        return starts;
    },

    showBottomBg() {
        this.bg.active = true;
        this.numNode.getComponent('scoreAni').showNormalNum(6, true);
        let end = this.bg.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return end;
    }

    // update (dt) {},
});
