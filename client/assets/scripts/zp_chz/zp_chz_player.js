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
    extends: require('../games/Game_player'),

    properties: {
        pokerPrefab: {  // 0 2 号玩家手牌  所有玩家出牌
            default: null,
            type: cc.Prefab
        },

        sspokerPrefab: {   // 1 3玩家手牌 0.72  进牌scale = 0.46   出牌scale = 0.39
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        this._holds = undefined;
        this._holdNodes = [];   //牌
        this._outNodes = [];

        /** 手牌节点 */
        this.holdsNode = this.node.getChildByName('holds');
        /** 弃牌节点 */
        this.outsNode = this.node.getChildByName('outsNode');
        /** 进牌节点 */
        this.insNode = this.node.getChildByName('insNode');

        this.turnNode = this.userNode.getChildByName('turnNode');

        this.bankerNode = this.userNode.getChildByName('bankerNode');
        this.bankerNode.active = false;

        this.outZPNode = cc.instantiate(this.pokerPrefab);
        if (this.localSeat == 0) {
            this.outZPNode.rotation = 90;
        }
        this.node.addChild(this.outZPNode);
        this._outZPPositions = [cc.p(0, 400),cc.p(-450, -60),cc.p(450, -60)];
        this.outZPNode.setPosition(this._outZPPositions[this.localSeat]);
        this.outZPNode.active = false;

        let huziCount = this.userNode.getChildByName('huziCount');
        this.huziCountLab = huziCount.getChildByName('huziCountLab');
        this.huziCountLab.getComponent(cc.Label).string = '0';
        this.piaofenNode = this.userNode.getChildByName('piaofen');
        this.piaofenLab = this.piaofenNode.getChildByName('piaofenLab');
        this.piaofenNode.active = false;

        this.initHolds();
    },

    /**
     * @param 初始化手牌长度  最大34
     * */
    initHolds() {
        //最多21张
        for(let i = 0; i < 21; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            this.holdsNode.addChild(poker);
            this._holdNodes.push(poker);
            poker.active = false;
        }
    },

    //显示字牌
    showAllHolds(needAni, value, pos) {
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
                cardNode.getComponent('Zipai').showSortValue(v, i, j, this._sortHolds.length, idx, needAni, (v < 21 && c > 2), pos);
                idx+=1;
                if (res_card == undefined && value == v) {
                    res_card = cardNode;
                }
            }
        }

        return res_card;
    },

    start() {
        if (this.localSeat == 0 ) {
            console.log(" 注册触摸事件！！！！ ");
            this.holdsNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            this.startPos = undefined;
            this.endPos = undefined;
        }
    },


    /**
     * 设置庄家  只有庄家才会调用此方法
     */
    setPlayerBanker(isBanker) {
        if (!this.node.active) {
            return;
        }
        this.bankerNode.active = isBanker;
        if(isBanker) {
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },

    piaofen(score) {
        this.piaofenNode.active = true;
        let str = cc.utils.getScoreStr(score);
        str = str.replace('万', 'B');
        this.piaofenLab.getComponent(cc.Label).string = str;
    },


    /**
     * 设置游戏数据  断线重连后
     * @param data
     */
    set(data) {
        if (!this.node.active ) {
            return;
        }
        let holds = data.holds;

        if(cc.dm.user.uid  == data.uid  && cc.dm.user.uid == this._uid ) {
            this.resetHolds(holds);
        }

        let c = this.insNode.getComponent('ZpInsNode').resetDatas(data.inPokers);
        if (Array.isArray(this._holds)) {
            c += this._algorithm.getAllHuzi(this._holds);
        }
        this.huziCountLab.getComponent(cc.Label).string = c;
        this.outsNode.getComponent('ZpOutsNode').resetDatas(data.outs);

        if (Array.isArray(this._holds)) {
            let need = false;
            let inPokers = this.insNode.getComponent('ZpInsNode')._inPokers;
            if (this._holds.length%3 == 1) {
                need = true;
            } else if (this._holds.length%3 == 2 && !this._algorithm.checkIsJiao(this._holds, inPokers)) {
                need = true;
            }
            if (!!need) {
                let tingData = this._algorithm.checkTing(this._holds, inPokers);
                cc.connect.emit('tingpai', tingData);
            }
        }

        let alreadyPiao = data.alreadyPiao;
        if (!!alreadyPiao) {
            let piaofenScore = data.piaofenScore;
            this.piaofen(piaofenScore);
        }
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        if (!this.node.active) {
            return;
        }

        this._super();

        this.bankerNode.active = false;
        this._holdNodes.forEach((el)=>{
            el.active = false;
        });

        this._outNodes.forEach((el)=>{
            el.active = false;
        });

        this.insNode.getComponent('ZpInsNode').reset();
        this.outsNode.getComponent('ZpOutsNode').reset();

        this.outZPNode.active = false;
        this.huziCountLab.getComponent(cc.Label).string = '0';
        this.stopClock();

        this.piaofenNode.active = false;

        this.resetStatus();
    },

    resetStatus() {
        this._holds = undefined;
        this._sortHolds = undefined;
        this._tempSortHolds = undefined;
        this._can = false;
        this._touchPoker = undefined;
    },

    /**
     * 重置手牌
     * @param holds
     */
    resetHolds(holds, pos) {
        this._holds = holds;
        if (!this._holds) {
            return;
        }

        if (Array.isArray(this._holds)) {
            this._sortHolds = this._algorithm.getSortHolds(this._holds);
            this.showAllHolds(false, undefined, pos);

            if (!!pos) {
                cc.vv.audioMgr.playSFX('chz/fapai.mp3');
                let tingData = this._algorithm.checkTing(this._holds, []);
                cc.connect.emit('tingpai', tingData);
            }
        }
    },

    /**
     * 轮转
     * @param isTurn
     */
    setTurn(isTurn, can) {
        if (!this.node.active) {
            return;
        }
        
        this._can = can;
        this.showTurnNode(isTurn);
        if (!!can && Array.isArray(this._holds)) {
            cc.connect.emit('tingpai');
        }
    },

    /**
     * 出牌错误
     */
    discardError(errmsg) {
        if (!!this._tempSortHolds) {
            this._sortHolds = this._tempSortHolds;
            this._tempSortHolds = undefined;
            this.showAllHolds(true);
        }

        this._touchPoker = undefined;
        cc.utils.openWeakTips(errmsg);
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
    discard(info, disconnect) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX('chz/putcards.mp3');
        cc.vv.audioMgr.playSFX('chz/'+this._sex+'/'+info.v+'.mp3');
        this._can = false;
        this._isdiscarding = false;
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        if (!!disconnect) {
            this.zpScr(this.outZPNode).showZPValue(info.v);
            this.outZPNode.getChildByName('paimian').color = cc.color(200, 200, 200, 255);
        } else {
            this._aniTimeOut = setTimeout(()=> {
                this.zpScr(this.outZPNode).showZPValue(info.v);
                this.outZPNode.getChildByName('paimian').color = cc.color(200, 200, 200, 255);
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
            if (!!this._touchPoker) {
                start = this._touchPoker.getNodeToWorldTransformAR();
                this._touchPoker.active = false;
                this._touchPoker = undefined;
            } else {
                if (Array.isArray(this._holds)) {
                    for (let i = 0; i < this._holdNodes.length; i++) {
                        let cardNode = this._holdNodes[i];
                        if (cardNode.active) {
                            let zpscr = cardNode.getComponent('Zipai');
                            if (zpscr._value == info.v) {
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
        }
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
                this.zpScr(this.outZPNode).showZPValue(info.v);
                this.outZPNode.getChildByName('paimian').color = cc.Color.WHITE;
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

            cc.connect.emit('tingpai');
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
        let c = res.c;
        if (Array.isArray(this._holds)) {
            c += this._algorithm.getAllHuzi(this._holds);
        }
        this.huziCountLab.getComponent(cc.Label).string = c;
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

    /**
     * 播放声音
     * @param type
     * @param values
     */
    playSound(data,value) {

    },

    /**
     * touch相关
     */
    onTouchStart: function (touch) {
        if (!Array.isArray(this._holds) || !!this._isdiscarding) {
            return false;
        }

        this.startPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        this._moved = false;
        for (let i =0 ; i < this._holdNodes.length; i++) {
            let el = this._holdNodes[i];
            if (!el.active) {
                continue;
            }

            if (el.getBoundingBox().contains(this.startPos)) {
                if (!el.getComponent('Zipai')._disable) {
                    this._touchPoker = el;
                    if (this._can) {
                        let inPokers = this.insNode.getComponent('ZpInsNode')._inPokers;
                        let tingData = this._algorithm.checkTing(this._holds, inPokers, this.zpScr(el)._value);
                        cc.connect.emit('tingpai', tingData);
                    }
                }
                return;
            }
        }
    },

    onTouchMove: function (touch) {
        if (!Array.isArray(this._holds) || !!this._isdiscarding) {
            return;
        }

        let prepoint = touch.getPreviousLocation();
        let curpoint = touch.getLocation();
        let tranpointx = curpoint.x-prepoint.x;
        let tranpointy = curpoint.y-prepoint.y;

        if(!!this._touchPoker) {
            this._touchPoker.x += tranpointx;
            this._touchPoker.y += tranpointy;
            this._touchPoker.setLocalZOrder(99);
        }

        this._moved = true;
    },


    onTouchEnd: function (touch) {
        if (!Array.isArray(this._holds) || !!this._isdiscarding) {
            return;
        }

        if (!this._moved) {
            if (this._can) {
                cc.connect.emit('tingpai');
            }
            this.resetTouchPoker();
            return;
        }

        this.endPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        this.touchEnd();
    },

    //连点  或滑动到手牌外
    touchEnd() {
        if(!!this._touchPoker) {
            let zpscr = this.zpScr(this._touchPoker);
            if (this._can) {
                let tBound = this._touchPoker.getBoundingBox();
                if (tBound.y > 130) {
                    if (zpscr._value == 21) {
                        /** 回到初始位置 */
                        this.resetTouchPoker();
                        if (!!this._can) {
                            cc.connect.emit('tingpai');
                        }
                        return;
                    }
                    /** 出牌 */
                    this._tempSortHolds = JSON.parse(JSON.stringify(this._sortHolds));
                    let i = zpscr._idxI;
                    let b = this._sortHolds[i];
                    let j = zpscr._idxJ;
                    let v = b.splice(j, 1)[0];
                    if (b.length == 0) {
                        this._sortHolds.splice(i, 1);
                    }
                    cc.connect.send('discard', v);
                    this._isdiscarding = true;
                    return;
                }
            }
            if (!!this._can) {
                cc.connect.emit('tingpai');
            }
            
            let changeNode = undefined;
            let x = this._touchPoker.x;
            /** 先找看有没有牌包含这张牌的中心点x的 */
            for (let i = 0; i < this._holdNodes.length; i++) {
                let cardNode = this._holdNodes[i];
                if (!cardNode.active) {
                    continue;
                }

                if (cardNode == this._touchPoker) {
                    continue;
                }

                let bounding = cardNode.getBoundingBox();
                if (bounding.x < x && x < bounding.x+bounding.width) {
                    changeNode = cardNode;
                }
            }

            if (!!changeNode) {
                let idxI = this.zpScr(changeNode)._idxI;
                let column = this._sortHolds[idxI];
                if (column.length < 4) {
                    let a = zpscr._idxI;
                    let b = this._sortHolds[a];
                    let c = zpscr._idxJ;
                    let v = b.splice(c, 1)[0];
                    if (b.length == 0) {
                        this._sortHolds.splice(a, 1);
                    }
                    column.push(v);
                    if (zpscr._idx < this.zpScr(changeNode)._idx) {
                        this._holdNodes.splice(zpscr._idx, 1);
                        this._holdNodes.splice(this.zpScr(changeNode)._idx, 0, this._touchPoker);
                    } else {
                        this._holdNodes.splice(zpscr._idx, 1);
                        this._holdNodes.splice(this.zpScr(changeNode)._idx+1, 0, this._touchPoker);
                    }
                    
                    this.showAllHolds(true);
                } else {
                    this.resetTouchPoker();
                }
            } else {
                if (this._sortHolds.length < 8 && x > 0) {
                    /** 新起一列 */
                    let a = this.zpScr(this._touchPoker)._idxI;
                    let b = this._sortHolds[a];
                    let c = this.zpScr(this._touchPoker)._idxJ;
                    let v = b.splice(c, 1)[0];
                    if (b.length == 0) {
                        this._sortHolds.splice(a, 1);
                    }
                    this._sortHolds.push([v]);
                    this._holdNodes.splice(zpscr._idx, 1);
                    this._holdNodes.splice(this._holdNodes.length, 0, this._touchPoker);
                    this.showAllHolds(true);
                } else {
                    /** 回到初始位置 */
                    this.resetTouchPoker();
                }
            }
            
        }
    },

    resetTouchPoker() {
        if(!!this._touchPoker) {
            this._touchPoker.setPosition(this.zpScr(this._touchPoker)._curPos);
            this._touchPoker.setLocalZOrder(this.zpScr(this._touchPoker)._zorder);
            this._touchPoker = undefined;
        }
    },

    zpScr(cardNode) {
        return cardNode.getComponent('Zipai');
    }, 

    /**
     * 显示这一把的分数
     * @param score
     */
    showScore(score, half) {
        this.piaofenNode.active = false;
        this.resScoreNode.active = true;
        this.resScoreNode.getComponent('resScore').showScore(score, half);
        if (!!half) {
            setTimeout(()=> {
                this.piaofenNode.active = true;
            }, 1000);
        }
    },

    onTable() {

    },

    showTurnNode(show) {
        if (show) {
            if (!!this.turnNode) {
                this.turnNode.active = true;
                this.turnNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            }
        } else {
            this.stopClock();
        }
    },

    stopClock() {
        if (!!this.turnNode) {
            this.turnNode.getComponent(sp.Skeleton).clearTracks();
            this.turnNode.active = false;
        }
    },

});
