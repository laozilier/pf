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
        mjPrefab: {
            default: null,
            type: cc.Prefab
        },

        localSeat: 0
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._idx = 0;
        this._inPokers = [];
        let starts = [[35, 0], [0, 20], [-24, 0], [0, -20]];
        let margins = [[71, 0], [0, 30], [-49, 0], [0, -30]];
        let fours = [[106, 14], [0, 60], [-73, 10], [0, -40]];
        let fourx = fours[this.localSeat][0];
        let foury = fours[this.localSeat][1];
        let startx = starts[this.localSeat][0];
        let starty = starts[this.localSeat][1];
        let marginx = margins[this.localSeat][0];
        let marginy = margins[this.localSeat][1];
        let zIndexs = [0, 2, 0, 0];
        let zIndexMargins = [1, -1, 1, 1];
        let zIndex = zIndexs[this.localSeat];
        let zIndexMargin = zIndexMargins[this.localSeat];
        this.node.children.forEach((el, idx) => {
            for (let i = 0; i < 4; i++) {
                let mjCard = cc.instantiate(this.mjPrefab);
                if (i == 3) {
                    el.addChild(mjCard, i, 'mjCard'+i);
                    mjCard.x = fourx;
                    mjCard.y = foury;
                } else {
                    el.addChild(mjCard, zIndex+(i*zIndexMargin), 'mjCard'+i);
                    mjCard.x = startx+(i*marginx);
                    mjCard.y = starty+(i*marginy);
                }
                mjCard.getComponent('mj').showInPokerMjValue(1, this.localSeat);
                mjCard.active = false;
            }
        });
    },

    start () {

    },

    reset() {
        this._idx = 0;
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
        this._inPokers = [];
        if (Array.isArray(data)) {
            for (let i = 0; i < data.length; i++) {
                let obj = data[i];
                let vs = obj.vs;
                let inPoker = this.node.getChildByName('inPoker'+i);
                inPoker.active = true;
                vs.forEach((v, idx) => {
                    let mjCard = inPoker.getChildByName('mjCard'+idx);
                    mjCard.active = true;
                    mjCard.getComponent('mj').showInPokerMjValue(v, this.localSeat);
                });

                inPoker.cardValue = obj.v;
                inPoker.cardType = obj.t;
                this._idx+=1;
            }

            this._inPokers = data;
        }
    },

    checkData(info) {
        //{v: 11, vs: Array(3), t: 2, hu: 3}
        let ends = [];
        /** 如果不是明杠 则新显示一列 否则 则从之前显示的里面找 */
        let t = info.t;
        let vs = info.vs;
        let inPoker = undefined;
        let gt = info.gt;
        let cards = [];
        if ((t == cc.game_enum.inPokerType.gang && gt == cc.game_enum.gangType.ming) || t == cc.game_enum.inPokerType.bu) {
            for (let i = 0; i < 4; i++) {
                let tempInPoker = this.node.getChildByName('inPoker'+i);
                if (tempInPoker.cardValue == info.v && tempInPoker.cardType == cc.game_enum.inPokerType.peng) {
                    inPoker = tempInPoker;
                    break;
                }
            }

            if (!!inPoker) {
                let mjCard = inPoker.getChildByName('mjCard3');
                mjCard.active = true;
                mjCard.getComponent('mj').showInPokerMjValue(info.v, this.localSeat);
                let end = mjCard.getNodeToWorldTransformAR();
                end = cc.p(end.tx, end.ty);
                ends.push(end);
                inPoker.gt = gt;
                inPoker.cardType = t;
                cards.push(mjCard);
            }
        } else {
            inPoker = this.node.getChildByName('inPoker'+this._idx);
            inPoker.active = true;
            vs.forEach((v, idx) => {
                let mjCard = inPoker.getChildByName('mjCard'+idx);
                mjCard.active = true;
                mjCard.getComponent('mj').showInPokerMjValue(v, this.localSeat);
                let end = mjCard.getNodeToWorldTransformAR();
                end = cc.p(end.tx, end.ty);
                ends.push(end);
                cards.push(mjCard);
                if (t == cc.game_enum.inPokerType.gang && gt == cc.game_enum.gangType.dian && idx == 3) {
                    mjCard.color = cc.color(200,200,200,255);
                }
            });

            inPoker.cardValue = info.v;
            inPoker.cardType = t;
            this._idx+=1;
            this._inPokers.push(info);
        }

        if (!!inPoker) {
            cards.forEach((el) => {
                el.active = true;
                el.stopAllActions();
                el.opacity = 8;
                el.runAction(cc.sequence(
                    cc.delayTime(1),
                    cc.callFunc(()=> {
                        el.opacity = 255;
                    })
                ));
            });
        }

        return ends;
    },

    // update (dt) {},
});
