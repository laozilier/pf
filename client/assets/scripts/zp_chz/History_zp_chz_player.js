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
        pokerPrefab: {  // 0 2 号玩家手牌  所有玩家出牌
            default: null,
            type: cc.Prefab
        },

        sspokerPrefab: {   // 1 3玩家手牌 0.72  进牌scale = 0.46   出牌scale = 0.39
            default: null,
            type: cc.Prefab
        },

        localSeat: 0,
    },

    // LIFE-CYCLE CALLBACKS:
    onLoad() {
        this._super();

        this._holds = null;
        this._holdNodes = [];   //牌

        /** 手牌节点 */
        this.holdsNode = this.node.getChildByName('holds');
        /** 弃牌节点 */
        this.outsNode = this.node.getChildByName('outsNode');
        /** 进牌节点 */
        this.insNode = this.node.getChildByName('insNode');

        this.bankerNode = this.userNode.getChildByName('banker');
        this.bankerNode.active = false;

        this.piaofenNode = this.userNode.getChildByName('piaofen');
        this.piaofenLab = this.piaofenNode.getChildByName('piaofenLab');
        this.piaofenNode.active = false;

        this.outZPNode = cc.instantiate(this.pokerPrefab);
        this.node.addChild(this.outZPNode);
        this.initHolds();
    },

    /**
     * @param 初始化手牌长度  最大34
     * */
    initHolds() {
        //最多21张
        for(let i = 0; i < 21; i++) {
            let poker = cc.instantiate( this.localSeat == 0 ? this.pokerPrefab : this.sspokerPrefab);
            this.holdsNode.addChild(poker);
            this._holdNodes.push(poker);
            poker.active = false;
        }
    },

    setUserInfo(info, score, uid) {
        if (!info) {
            return;
        }

        this._super(info, score, uid);

        if (this.localSeat == 0) {
            this.outZPNode.rotation = 90;
        }
        this._outZPPositions = [cc.p(0, 400),cc.p(-450, -60),cc.p(450, -60)];
        this.outZPNode.setPosition(this._outZPPositions[this.localSeat]);
        this.outZPNode.active = false;
    },

    /**
     * 设置玩家庄 断线重连后
     * @param data
     */
    setPlayerBanker(isBanker) {
        this.bankerNode.active = isBanker;
        if (isBanker) {
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },
    
    /**
     * 重置所有节点
     */
    resetNodes() {
        if (!this.node.active) {
            return;
        }

        this.bankerNode.active = false;
        this._holdNodes.forEach((el)=>{
            el.active = false;
        });

        this.insNode.getComponent('ZpInsNode').reset();
        this.outsNode.getComponent('ZpOutsNode').reset();

        this.outZPNode.active = false;
        this.resetStatus();
    },

    resetStatus() {
        this._holds = null;
    },

    /**
     * 重置手牌
     * @param holds
     */
    resetHolds(holds) {
        this._holds = holds;
        if (!this._holds) {
            return;
        }

        if (Array.isArray(this._holds)) {
            this._sortHolds = this._algorithm.getSortHolds(this._holds);
            this.showAllHolds();
        }
    },

    piaofen(score) {
        this.piaofenNode.active = true;
        let str = cc.utils.getScoreStr(score);
        str = str.replace('万', 'B');
        this.piaofenLab.getComponent(cc.Label).string = str;
    },

    //显示字牌
    showAllHolds(needAni, value) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        if (!needAni) {
            this._holdNodes.forEach((el)=>{
                el.active = false;
            });
        }
        let idx = 0;
        let res_card = undefined;
        for (let i = 0; i < this._sortHolds.length; i++) {
            let cols = this._sortHolds[i];
            for (let j = 0; j < cols.length; j++) {
                let v = cols[j];
                let cardNode = this._holdNodes[idx];
                while (needAni && !!cardNode && !cardNode.active) {
                    idx+=1;
                    cardNode = this._holdNodes[idx];
                }
                if (!cardNode) {
                    return;
                }
                cardNode.active = true;
                let c = this._algorithm.getCardCount(v, this._holds);
                cardNode.getComponent('Zipai').showSortValue(v, i, j, this._sortHolds.length, idx, needAni, (v < 21 && c > 2));
                idx+=1;
                if (res_card == undefined && value == v) {
                    res_card = cardNode;
                }
            }
        }

        return res_card;
    },

    sishou() {
        cc.vv.audioMgr.playSFX('chz/'+this._sex+'/sishou.mp3');
        let action_p = this.outZPNode.getNodeToWorldTransformAR();
        return cc.p(action_p.tx, action_p.ty);
    },

    /**
     * 出牌
     * @param info
     */
    discard(info) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX('chz/putcards.mp3');
        cc.vv.audioMgr.playSFX('chz/'+this._sex+'/'+info.v+'.mp3');
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }
        this._aniTimeOut = setTimeout(()=> {
            this.zpScr(this.outZPNode).showZPValue(info.v);
            this.outZPNode.getChildByName('paimian').color = cc.color(200,200,200,255);
        }, 500);

        /** 从手牌中移除这张牌 */
        if (Array.isArray(this._holds)) {
            let idx = this._holds.indexOf(info.v);
            if (idx > -1) {
                this._holds.splice(idx, 1);
            }
        }

        let res = {show: true};
        let start = undefined;
        if (Array.isArray(this._holds)) {
            for (let i = 0; i < this._holdNodes.length; i++) {
                let cardNode = this._holdNodes[i];
                if (cardNode.active) {
                    let zpscr = cardNode.getComponent('Zipai');
                    if (zpscr._value == info.v) {
                        /** 出牌 */
                        let idxI = zpscr._idxI;
                        let b = this._sortHolds[idxI];
                        let idxJ = zpscr._idxJ;
                        b.splice(idxJ, 1);
                        if (b.length == 0) {
                            this._sortHolds.splice(idxI, 1);
                        }
                        start = cardNode.getNodeToWorldTransformAR();
                        cardNode.active = false;
                        break;
                    }
                }
            }
        }

        this.showAllHolds(true);

        if (start == undefined) {
            start = this.userNode.getNodeToWorldTransformAR();
            res.show = false;
        }

        start = cc.p(start.tx, start.ty);
        res.start = start;
        let end = this.outZPNode.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        res.end = end;
        return res;
    },

    /**
     * 摸牌
     * @param {*} info 
     */
    drawCard(info) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX("public/fapai.mp3");
        if (info.v > 0) {
            cc.vv.audioMgr.playSFX('chz/'+this._sex+'/'+info.v+'.mp3');
        }

        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        if (!!info.hu) {} else {
            this._aniTimeOut = setTimeout(()=> {
                this.outZPNode.getChildByName('paimian').color = cc.Color.WHITE;
                this.zpScr(this.outZPNode).showZPValue(info.v);
            }, 500);
        }

        let p = this.outZPNode.getNodeToWorldTransformAR();
        return cc.p(p.tx, p.ty);
    },

    /**
     * 弃牌
     */
    qiPoker(info) {
        if (!this.node.active) {
            return;
        }

        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        let end = this.outsNode.getComponent('ZpOutsNode').checkData(info);
        let start = this.outZPNode.getNodeToWorldTransformAR();
        start = cc.p(start.tx, start.ty);
        this.outZPNode.active = false;
        return {start: start, end: end};
    },

    /**
     * 隐藏摸的牌或者出的牌
     */
    clearOutCards() {
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }
        
        this.outZPNode.active = false;
    },

    bankLastcard(v) {
        if (!this.node.active) {
            return;
        }

        let end = undefined;
        if (Array.isArray(this._holds)) {
            for (let i = 0; i < this._holdNodes.length; i++) {
                let cardNode = this._holdNodes[i];
                if (cardNode.active && cardNode.getComponent('Zipai')._value == v) {
                    end = cardNode.getNodeToWorldTransformAR();
                    cardNode.opacity = 8;
                    setTimeout(()=> {
                        cardNode.opacity = 255;
                    }, 1000);
                    break;
                }
            }
        }
        if (!end) {
            end = this.userNode.getNodeToWorldTransformAR();
        }
        end = cc.p(end.tx, end.ty);
        return end;
    },

    addHolds(v) {
        if (!this.node.active) {
            return;
        }

        let end = undefined;
        if (Array.isArray(this._holds)) {
            this._holds.push(v);
            let need = true;
            for (let i = this._sortHolds.length-1; i > -1; i--) {
                let column = this._sortHolds[i];
                if (column.length < 3) {
                    column.push(v);
                    need = false;
                    break;
                }
            }

            if (need) {
                this._sortHolds.push([v]);
            }

            let n = this.showAllHolds(false, v);
            if (!!n) {
                end = n.getNodeToWorldTransformAR();
                end = cc.p(end.tx, end.ty);
                n.stopAllActions();
                n.opacity = 8;
                setTimeout(()=> {
                    n.opacity = 255;
                }, 500);
            }
        }

        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }
        let start = this.outZPNode.getNodeToWorldTransformAR();
        start = cc.p(start.tx, start.ty);
        this.outZPNode.active = false;
        return {start: start, end: end};
    },

    actionHu(huType) {
        let strs = ['hu', 'hu', 'hu', 'wd', 'wd', 'wc', 'wc', 'wz', 'wz'];
        cc.vv.audioMgr.playSFX('chz/'+this._sex+'/'+strs[huType]+'.mp3');
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }
        let out_p = this.outZPNode.getNodeToWorldTransformAR();
        out_p = cc.p(out_p.tx, out_p.ty);
        if (huType == cc.zp_chz_enum.huType.dianpao || huType == cc.zp_chz_enum.huType.zimo) {
            return;
        }
        this.outZPNode.active = false;
        let res = {out_p: out_p};
        let vs = [];
        if (huType == cc.zp_chz_enum.huType.wangzha || huType == cc.zp_chz_enum.huType.wangzhawang) {
            vs = [21, 21, 21];
        } else if (huType == cc.zp_chz_enum.huType.wangchuang || huType == cc.zp_chz_enum.huType.wangchuangwang) {
            vs = [21, 21];
        } else if (huType == cc.zp_chz_enum.huType.wangdiao || huType == cc.zp_chz_enum.huType.wangdiaowang) {
            vs = [21];
        }

        let starts = this.delCards(vs);
        res.starts = starts;
        return res;
    },

    /**
     * 进牌
     * @param {*} info
     * @param {*} out_p
     */
    inPoker (info, out_p) {
        let res = this.insNode.getComponent('ZpInsNode').checkData(info);
        let ends = res.ends;
        let starts = res.starts;
        let isFromIns = starts.length > 0;
        let isAllFromHolds = false;

        /** 删除手上对应的牌 并给出动画 也有可能直接从进牌节点里面发生动画 */
        let t = info.t;
        let v = info.v;
        let vs = [].concat(info.vs);
        if (t == cc.zp_chz_enum.inPokerType.chi) {
            if (!info.xh) {
                vs.splice(0, 1);
            } else {
                isAllFromHolds = true;
            }
            starts = this.delCards(vs);
            if (!!info.xh) {
                cc.vv.audioMgr.playSFX('chz/'+this._sex+'/xiahuo.mp3');
            } else {
                cc.vv.audioMgr.playSFX('chz/'+this._sex+'/chi.mp3');
            }
        } else if (t == cc.zp_chz_enum.inPokerType.peng) {
            starts = this.delCards([v, v]);
            cc.vv.audioMgr.playSFX('chz/'+this._sex+'/peng.mp3');
        } else if (t == cc.zp_chz_enum.inPokerType.xiao) {
            starts = this.delCards([v, v], true);
            if (!!info.g) {
                cc.vv.audioMgr.playSFX('chz/'+this._sex+'/guoxiao.mp3');
            } else {
                cc.vv.audioMgr.playSFX('chz/'+this._sex+'/xiao.mp3');
            }
        } else if (t == cc.zp_chz_enum.inPokerType.jiao) {
            let p = info.p; //是否是碰转交
            let x = info.x; //是否是啸转交
            if (!p && !x) {
                starts = this.delCards([v, v, v]);
            }

            if (!!info.c) {
                cc.vv.audioMgr.playSFX('chz/'+this._sex+'/chongjiao.mp3');
            } else {
                cc.vv.audioMgr.playSFX('chz/'+this._sex+'/jiao.mp3');
            }
        } else if (t == cc.zp_chz_enum.inPokerType.qing) {
            let x = info.x; //是否是啸转倾
            if (!x) {
                starts = this.delCards([v, v, v], true);
            }

            cc.vv.audioMgr.playSFX('chz/'+this._sex+'/qing.mp3');
            if (!!info.c) {
                cc.vv.audioMgr.playSFX('chz/'+this._sex+'/chongjiao.mp3');
            }
        }

        let my_out_p = this.outZPNode.getNodeToWorldTransformAR();
        return {
            starts: starts,
            out_p: out_p,
            ends: ends,
            isFromIns: isFromIns,
            isAllFromHolds: isAllFromHolds,
            my_out_p: my_out_p
        };
    },

    /** 删除玩家手上某些牌 */
    delCards (data, canNotSee) {
        let starts = [];
        if (Array.isArray(data)) {
            data.forEach(el => {
                if (Array.isArray(this._holds)) {
                    let idx = this._holds.indexOf(el);
                    if (idx > -1) {
                        this._holds.splice(idx, 1);
                        for (let i = 0; i < this._sortHolds.length; i++) {
                            let column = this._sortHolds[i];
                            let stop = false;
                            for (let j = 0; j < column.length; j++) {
                                let v = column[j];
                                if (v == el) {
                                    column.splice(j, 1);
                                    stop = true;
                                    break;
                                }
                            }
                            if (stop) {
                                if (column.length == 0) {
                                    this._sortHolds.splice(i, 1);
                                }
                                break;
                            }
                        }

                        for (let i = 0; i < this._holdNodes.length; i++) {
                            let cardNode = this._holdNodes[i];
                            if (!cardNode.active) {
                                continue;
                            }
                            let src = this.zpScr(cardNode);
                            if (src._value == el) {
                                cardNode.active = false;
                                let p = cardNode.getNodeToWorldTransformAR();
                                starts.push({p: p, v: canNotSee ? -1 : el});
                                break;
                            }
                        }
                    }
                } else {
                    let p = this.userNode.getNodeToWorldTransformAR();
                    starts.push({p: p, v: canNotSee ? -1 : el});
                }
            });

            if (Array.isArray(this._holds)) {
                this.showAllHolds(true);
            }
        }

        return starts;
    },
});
