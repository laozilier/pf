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
        zpPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._idx = 0;
        this._huzi = 0;
        this._inPokers = [];
        this.node.children.forEach((el, idx) => {
            for (let i = 0; i < 4; i++) {
                let card = cc.instantiate(this.zpPrefab);
                el.addChild(card, i, 'zp'+i);
                card.x = 0;
                card.y = -55-i*98;
                card.active = false;
            }
        });
    },

    start () {

    },

    reset() {
        this._idx = 0;
        this._huzi = 0;
        this._inPokers = [];
        this.node.children.forEach(el => {
            el.children.forEach(n => {
                n.active = false;
            });

            el.active = false;
            el.cardValue = -1;
            el.cardType = -1;
        });
    },

    resetDatas(data) {
        this._idx = 0;
        this._huzi = 0;
        this._inPokers = [];
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                let obj = data[i];
                let vs = obj.vs;
                let inPoker = this.node.getChildByName('inPoker'+i);
                inPoker.active = true;
                vs.forEach((v, idx) => {
                    let card = inPoker.getChildByName('zp'+idx);
                    card.active = true;
                    card.getComponent('Zipai').showZPValue(v);
                });
                let hu = obj.hu;
                if (hu > 0) {
                    let huziLab = inPoker.getChildByName('huziLab');
                    huziLab.active = true;
                    huziLab.getComponent(cc.Label).string = hu;
                    this._huzi+=hu;
                }

                let card0 = inPoker.getChildByName('zp0');
                if (!!obj.dis) {
                    card0.getChildByName('paimian').color = cc.color(200,200,200,255);
                } else {
                    card0.getChildByName('paimian').color = cc.Color.WHITE;
                }

                inPoker.cardValue = obj.v;
                inPoker.cardType = obj.t;
                this._idx+=1;
            }

            this._inPokers = data;
        }

        return this._huzi;
    },

    checkData(info) {
        //{v: 11, vs: Array(3), t: 2, hu: 3}
        let res = {starts: [], ends: []};
        /** 如果是吃碰啸 则新显示一列 如果是倾交 则从之前显示的里面找 */
        let starts = res.starts;
        let ends = res.ends;
        let t = info.t;
        let vs = info.vs;
        let inPoker = undefined;
        if (t == cc.zp_chz_enum.inPokerType.chi || t == cc.zp_chz_enum.inPokerType.peng || t == cc.zp_chz_enum.inPokerType.xiao) {
            inPoker = this.node.getChildByName('inPoker'+this._idx);
            inPoker.active = true;
            vs.forEach((v, idx) => {
                let card = inPoker.getChildByName('zp'+idx);
                card.active = true;
                card.getComponent('Zipai').showZPValue(v);
                let p = card.getNodeToWorldTransformAR();
                ends.push(p);
            });
            let hu = info.hu;
            if (hu > 0) {
                let huziLab = inPoker.getChildByName('huziLab');
                huziLab.active = true;
                huziLab.getComponent(cc.Label).string = hu;
                this._huzi+=hu;
            }

            let card0 = inPoker.getChildByName('zp0');
            if (!!info.dis) {
                card0.getChildByName('paimian').color = cc.color(200,200,200,255);
            } else {
                card0.getChildByName('paimian').color = cc.Color.WHITE;
            }
            inPoker.cardValue = info.v;
            inPoker.cardType = t;
            this._idx+=1;
            this._inPokers.push(info);
        } else if (t == cc.zp_chz_enum.inPokerType.qing) {
            if (!!info.x) {
                for (let i = 0; i < 7; i++) {
                    inPoker = this.node.getChildByName('inPoker'+i);
                    if (inPoker.cardType == cc.zp_chz_enum.inPokerType.xiao && (inPoker.cardValue == info.v || inPoker.cardValue == -1)) {
                        let card = inPoker.getChildByName('zp3');
                        card.active = true;
                        card.getComponent('Zipai').showZPValue(-1);
                        inPoker.cardType == cc.zp_chz_enum.inPokerType.qing;
                        info.vs.forEach((v, idx) => {
                            let n = inPoker.getChildByName('zp'+idx);
                            let p = n.getNodeToWorldTransformAR();
                            if (idx < 3) {
                                starts.push({p: p, v: -1});
                            }

                            ends.push(p);
                        });
                        let hu = info.hu;
                        let huziLab = inPoker.getChildByName('huziLab');
                        huziLab.active = true;
                        huziLab.getComponent(cc.Label).string = hu;
                        this._huzi+=6;
                        this._inPokers[i] = info;
                        break;
                    }
                }
            } else {
                inPoker = this.node.getChildByName('inPoker'+this._idx);
                inPoker.active = true;
                vs.forEach((v, idx) => {
                    let card = inPoker.getChildByName('zp'+idx);
                    card.active = true;
                    card.getComponent('Zipai').showZPValue(v);
                    let p = card.getNodeToWorldTransformAR();
                    ends.push(p);
                });
        
                inPoker.cardValue = info.v;
                inPoker.cardType = t;
                let hu = info.hu;
                let huziLab = inPoker.getChildByName('huziLab');
                huziLab.active = true;
                huziLab.getComponent(cc.Label).string = hu;
                this._huzi+=hu;
                this._idx+=1;
                this._inPokers.push(info);
            }
        } else if (t == cc.zp_chz_enum.inPokerType.jiao) {
            let x = info.x;
            let p = info.p;
            if (!!x) {
                for (let i = 0; i < 7; i++) {
                    inPoker = this.node.getChildByName('inPoker'+i);
                    if (inPoker.cardType == cc.zp_chz_enum.inPokerType.xiao && (inPoker.cardValue == info.v || inPoker.cardValue == -1)) {
                        inPoker.cardType = t;
                        vs.forEach((v, idx) => {
                            let card = inPoker.getChildByName('zp'+idx);
                            card.active = true;
                            card.getComponent('Zipai').showZPValue(v);
                            let p = card.getNodeToWorldTransformAR();
                            if (idx < 3) {
                                starts.push({p: p, v: v});
                            }
                            ends.push(p);
                        });
                        let hu = info.hu;
                        let huziLab = inPoker.getChildByName('huziLab');
                        huziLab.active = true;
                        huziLab.getComponent(cc.Label).string = hu;
                        this._huzi+=3;

                        let card0 = inPoker.getChildByName('zp0');
                        if (!!info.dis) {
                            card0.getChildByName('paimian').color = cc.color(200,200,200,255);
                        } else {
                            card0.getChildByName('paimian').color = cc.Color.WHITE;
                        }

                        this._inPokers[i] = info;
                        break;
                    }
                }
            } else if (!!p) {
                for (let i = 0; i < 7; i++) {
                    inPoker = this.node.getChildByName('inPoker'+i);
                    if (inPoker.cardType == cc.zp_chz_enum.inPokerType.peng && inPoker.cardValue == info.v) {
                        let card = inPoker.getChildByName('zp3');
                        card.active = true;
                        card.getComponent('Zipai').showZPValue(info.v);
                        inPoker.cardType = t;
                        for (let j = 0; j < 4; j++) {
                            let n = inPoker.getChildByName('zp'+j);
                            let p = n.getNodeToWorldTransformAR();
                            if (j < 3) {
                                starts.push({p: p, v: info.v});
                            }
                            ends.push(p);
                        }
                        let hu = info.hu;
                        let huziLab = inPoker.getChildByName('huziLab');
                        huziLab.active = true;
                        huziLab.getComponent(cc.Label).string = hu;
                        this._huzi+=(info.v > 10 ? 6 : 5);
                        let card0 = inPoker.getChildByName('zp0');
                        if (!!info.dis) {
                            card0.getChildByName('paimian').color = cc.color(200,200,200,255);
                        } else {
                            card0.getChildByName('paimian').color = cc.Color.WHITE;
                        }

                        this._inPokers[i] = info;
                        break;
                    }
                }
            } else {
                inPoker = this.node.getChildByName('inPoker'+this._idx);
                inPoker.active = true;
                vs.forEach((v, idx) => {
                    let card = inPoker.getChildByName('zp'+idx);
                    card.active = true;
                    card.getComponent('Zipai').showZPValue(v);
                    let p = card.getNodeToWorldTransformAR();
                    ends.push(p);
                });
        
                inPoker.cardValue = info.v;
                inPoker.cardType = t;
                let hu = info.hu;
                if (hu > 0) {
                    let huziLab = inPoker.getChildByName('huziLab');
                    huziLab.active = true;
                    huziLab.getComponent(cc.Label).string = hu;
                    this._huzi+=hu;
                }
                let card0 = inPoker.getChildByName('zp0');
                if (!!info.dis) {
                    card0.getChildByName('paimian').color = cc.color(200,200,200,255);
                } else {
                    card0.getChildByName('paimian').color = cc.Color.WHITE;
                }
                this._idx+=1;
                this._inPokers.push(info);
            }
        }

        if (!!inPoker) {
            inPoker.children.forEach((el) => {
                if (el.active) {
                    el.stopAllActions();
                    el.opacity = 8;
                    el.runAction(cc.sequence(
                        cc.delayTime(0.5),
                        cc.callFunc(()=> {
                            el.opacity = 255;
                        })
                        //cc.fadeTo(0.1, 255)
                    ));
                }
            });
        }

        res.c = this._huzi;
        return res;
    },

    // update (dt) {},
});
