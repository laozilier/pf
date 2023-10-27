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
    extends: require('../games/History_Player'),

    properties: {
        mjPrefab: {
            default: null,
            type: cc.Prefab
        },

        localSeat: 0,
    },

    // LIFE-CYCLE CALLBACKS:

    /**
     * 父类调用onload后调用
     */
    onLoad () {
        this._super();

        this._holds = null;
        this._holdNodes = [];   //牌

        /** 手牌节点 */
        this.holdsNode = this.node.getChildByName('holds');
        /** 弃牌节点 */
        this.outsNode = this.node.getChildByName('outsNode');
        /** 进牌节点 */
        this.insNode = this.node.getChildByName('insNode');

        for (let i = 0; i < 13; i++) {
            let mjNode = cc.instantiate(this.mjPrefab);
            this.holdsNode.addChild(mjNode, 0, 'mj'+i);
            this._holdNodes.push(mjNode);
            mjNode.active = false;
        }

        /** 弃牌节点 */
        this.outsNode = this.node.getChildByName('outsNode');
        /** 进牌节点 */
        this.insNode = this.node.getChildByName('insNode');

        this._rightPositions = [cc.p(-63, 68), cc.p(0, 40), cc.p(26, 0), cc.p(0, -40)];
        this.rightMjNode = cc.instantiate(this.mjPrefab);
        this.rightMjNode.setPosition(this._rightPositions[this.localSeat]);
        this.holdsNode.addChild(this.rightMjNode);
        this.rightMjNode.active = false;

        this.outMJNode = this.node.getChildByName('outMJNode');
        let mjNode = cc.instantiate(this.mjPrefab);
        this.outMJNode.addChild(mjNode, 0, 'mjNode');

        this.bankerNode = this.userNode.getChildByName('bankerNode');
        this.bankerNode.active = false;
    },

    /**
     * 重置所有节点
     */
    resetNodes () {
        if (!this.node.active) {
            return;
        }

        this._holdNodes.forEach(function (n) {
            n.active = false;
        });

        this.outsNode.getComponent('MjOutsNode').reset();
        this.insNode.getComponent('MjInsNode').reset();
        this.rightMjNode.color = cc.Color.WHITE;
        let mjNode = this.outMJNode.getChildByName('mjNode');
        mjNode.color = cc.Color.WHITE;
        this.rightMjNode.active = false;
        this.bankerNode.active = false;
        this.outMJNode.active = false;
        this.resetStatus();
    },

    /**
     * 重置所有状态(清空当前已保存的牌局相关数据)
     */
    resetStatus () {
        this._holds = undefined;
        this._rightValue = undefined;
    },

    setHolds(holds) {
        this._holds = holds;
    },

    sortHolds() {
        this._holds.sort((a, b) => {
            if (a == this._algorithm.laizi && b != this._algorithm.laizi) {
                return 1;
            }

            if (a != this._algorithm.laizi && b == this._algorithm.laizi) {
                return -1;
            }

            return b-a;
        });
    },

    /**
     * 设置庄家  只有庄家才会调用此方法
     */
    setPlayerBanker(show) {
        if (!this.node.active) {
            return;
        }

        if(show && !!this.bankerNode) {
            this.bankerNode.active = true;
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 显示手牌
     * @param {*} need 是否需要显示右手那张牌
     * @param {*} ani 是否需要显示动画
     */
    showHolds(need=false, ani=false) {
        this.rightMjNode.setPosition(this._rightPositions[this.localSeat]);
        this._tempHolds = [].concat(this._holds);
        if (need) {
            let rightValue = this._tempHolds.shift();
            this.mjScript(this.rightMjNode).showSortTansMjValue(rightValue, this.localSeat, -1, false);
        } else {
            this.rightMjNode.active = false;
        }

        this._tempHolds.sort((a, b) => {
            if (a == this._algorithm.laizi && b != this._algorithm.laizi) {
                return 1;
            }

            if (a != this._algorithm.laizi && b == this._algorithm.laizi) {
                return -1;
            }

            return b-a;
        });

        for (let i = 0; i < this._holdNodes.length; i++) {
            let mjNode = this._holdNodes[i];
            let v = this._tempHolds[i];
            if (isNaN(v)) {
                mjNode.active = false;
            } else {
                let v = this._tempHolds[i];
                this.mjScript(mjNode).showSortTansMjValue(v, this.localSeat, i, ani);
            }
        }
    },

    /**
     * 庄家最后一张牌
     * @param {*} v 
     */
    bankLastcard(v) {
        if (!this.node.active) {
            return;
        }

        if (Array.isArray(this._holds)) {
            this._holds.push(v);
        } else if (typeof this._holds == 'number') {
            this._holds += 1;
        }

        this.mjScript(this.rightMjNode).showSortTansMjValue(v, this.localSeat, -1, false);
    },

    drawCard(info) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX("mj/drawcard.mp3");
        // if (info.v > 0) {
        //     cc.vv.audioMgr.playSFX('mj/'+this._sex+'/'+info.v+'.mp3');
        // }
        this._holds.unshift(info.v);
        this.rightMjNode.setPosition(this._rightPositions[this.localSeat]);
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        this._aniTimeOut = setTimeout(()=> {
            this.mjScript(this.rightMjNode).showTansMjValue(info.v, this.localSeat);
        }, 300);

        let end = this.rightMjNode.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return {end: end};
    },

    /**
     * 弃牌
     */
    qiPoker(v) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX('mj/putcards.mp3');

        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        let end = this.outsNode.getComponent('MjOutsNode').checkData(v);
        let start = this.outMJNode.getNodeToWorldTransformAR();
        start = cc.p(start.tx, start.ty);
        this.outMJNode.active = false;
        return {start: start, end: end};
    },

    lastQiPoker(show) {
        if (!this.node.active) {
            return;
        }
        this.outsNode.getComponent('MjOutsNode').lastQiPoker(show);
    },

    /**
     * 隐藏摸的牌或者出的牌
     */
    clearOutCards() {
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }
        this.outMJNode.active = false;
    },

    discard(info) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX('mj/putcards.mp3');
        cc.vv.audioMgr.playSFX('mj/'+this._sex+'/'+info.v+'.mp3');

        this._discarding = false;
        this._can = false;
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        let mjNode = this.outMJNode.getChildByName('mjNode');
        this._aniTimeOut = setTimeout(()=> {
            this.outMJNode.active = true;
            this.mjScript(mjNode).showTansMjValue(info.v);
        }, 200);

        let start = undefined;
        let rightValue = this.mjScript(this.rightMjNode)._value;
        if (rightValue == info.v) {
            start = this.rightMjNode.getNodeToWorldTransformAR();
            this.rightMjNode.active = false;
        } else {
            let to = 0;
            let from = this._tempHolds.indexOf(info.v);
            this._tempHolds.splice(from, 1);
            /** 将右手第一张牌加入手牌中正确位置 */
            let rightValue = this.mjScript(this.rightMjNode)._value;
            if (rightValue == this._algorithm.laizi) {
                to = this._tempHolds.length;
                this._tempHolds.push(rightValue);
            } else {
                for (let i = 0; i < this._tempHolds.length; i++) {
                    let tempv = this._tempHolds[i];
                    if (rightValue > tempv || tempv == this._algorithm.laizi) {
                        to = i;
                        break;
                    }
                }
                this._tempHolds.splice(to, 0, rightValue);
            }

            let arr = this._holdNodes.splice(from, 1);
            let mjNode = arr[0];
            start = mjNode.getNodeToWorldTransformAR();
            if (to < this._holdNodes.length) {
                this._holdNodes.splice(to, 0, mjNode);
            } else {
                this._holdNodes.push(mjNode);
            }

            mjNode.opacity = 0;
            setTimeout(() => {
                mjNode.opacity = 255;
            }, 200);
        }

        start = cc.p(start.tx, start.ty);
        /** 从手牌中移除这张牌 */
        let idx = this._holds.indexOf(info.v);
        if (idx > -1) {
            this._holds.splice(idx, 1);
        }

        this.showHolds(false, true);
        let end = this.outMJNode.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return {start: start, end: end};
    },

    inPoker(info) {
        let ends = this.insNode.getComponent('MjInsNode').checkData(info);
        let starts = [];
        /** 删除手上对应的牌 并给出动画 也有可能直接从进牌节点里面发生动画 */
        let t = info.t;
        let v = info.v;
        let vs = [].concat(info.vs);
        let need = true;
        if (t == cc.game_enum.inPokerType.gang) {
            let gt = info.gt;
            if (gt == cc.game_enum.gangType.an) {
                vs = [v, v, v, v];
            } else if (gt == cc.game_enum.gangType.dian) {
                vs = [v, v, v];
            } else {
                vs = [v];
            }
            this.delCards(vs, starts);
            need = false;
        } else if (t == cc.game_enum.inPokerType.bu) {
            vs = [v];
            this.delCards(vs, starts);
            need = false;
        } else {
            vs.splice(0, 1);
            this.delCards(vs, starts);
        } 
        
        if (!!need) {
            this.sortHolds();
        }

        this.showHolds(need, true);

        switch (t) {
            case cc.game_enum.inPokerType.chi:
                cc.vv.audioMgr.playSFX('mj/'+this._sex+'/chi'+cc.utils.getRandom(1,2)+'.mp3');
                break;
            case cc.game_enum.inPokerType.peng:
                cc.vv.audioMgr.playSFX('mj/'+this._sex+'/peng'+cc.utils.getRandom(1,2)+'.mp3');
                break;
            case cc.game_enum.inPokerType.gang:
                cc.vv.audioMgr.playSFX('mj/'+this._sex+'/gang'+cc.utils.getRandom(1,2)+'.mp3');
                break;
            case cc.game_enum.inPokerType.bu:
                cc.vv.audioMgr.playSFX('mj/'+this._sex+'/buzhang.mp3');
                break;
            default:
                break;
        }

        return {
            starts: starts,
            ends: ends,
        };
    },

    /** 删除玩家手上某些牌 */
    delCards (vs, starts) {
        for (let i = 0; i < vs.length; i++) {
            let el = vs[i];
            let idx = this._holds.indexOf(el);
            if (idx < 0) {
                return;
            }

            this._holds.splice(idx, 1);
            if (this.rightMjNode.active) {
                let rightValue = this.mjScript(this.rightMjNode)._value;
                if (rightValue == el) {
                    let start = this.rightMjNode.getNodeToWorldTransformAR();
                    start = cc.p(start.tx, start.ty);
                    starts.push(start);
                    this.rightMjNode.active = false;
                    continue;
                }
            }

            let from = this._tempHolds.indexOf(el);
            this._tempHolds.splice(from, 1);
            let arr = this._holdNodes.splice(from, 1);
            let mjCard = arr[0];
            this._holdNodes.push(mjCard);
            let start = mjCard.getNodeToWorldTransformAR();
            start = cc.p(start.tx, start.ty);
            starts.push(start);
            mjCard.active = false;
        }

        /** 最后检查右手那张牌还是不是显示的 如果是则找个正确的位置 */
        if (this.rightMjNode.active) {
            let rightValue = this.mjScript(this.rightMjNode)._value;
            let to = undefined;
            for (let i = 0; i < this._tempHolds.length; i++) {
                let tempv = this._tempHolds[i];
                if (rightValue > tempv || tempv == this._algorithm.laizi) {
                    to = i;
                    break;
                }
            }

            if (typeof to == 'number') {
                let mjCard = this._holdNodes.pop();
                this._holdNodes.splice(to, 0, mjCard);
            }
        }
    },

    zimo() {
        this.rightMjNode.color = cc.hexToColor('#FFBBBB');
        cc.vv.audioMgr.playSFX('mj/'+this._sex+'/zimo'+cc.utils.getRandom(1,2)+'.mp3');
    },

    dianpao(idx) {
        let colors = [cc.hexToColor('#BBBEFF'), cc.hexToColor('#FFE7BB'), cc.hexToColor('#FFBBBB')];
        let mjNode = this.outMJNode.getChildByName('mjNode');
        mjNode.color = colors[idx] || cc.Color.WHITE;
        cc.vv.audioMgr.playSFX('mj/'+this._sex+'/dianpao'+cc.utils.getRandom(1,3)+'.mp3');
    },
});
