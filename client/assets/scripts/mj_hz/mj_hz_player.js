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
        mjPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    /**
     * 父类调用onload后调用
     */
    onLoad () {
        this._super();

        this.laizi = 35;
        this._holdNodes = [];
        this.bankerNode = this.userNode.getChildByName('bankerNode');
        this.bankerNode.active = false;

        this.turnNode = this.userNode.getChildByName('turnNode');
        /** 手牌节点 */
        this.holdsNode = this.node.getChildByName('holds');
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
    },

    start() {
        if (this.localSeat == 0 ) {
            console.log(" 注册触摸事件！！！！ ");
            this.holdsNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
        }
    },

    /**
     * 重置所有节点
     */
    resetNodes () {
        if (!this.node.active) {
            return;
        }

        this._super();
        //清空动画
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
        this._touchPoker = undefined;
    },

    /**
     * 设置游戏数据  断线重连后会进来
     * @param data
     */
    set(data) {
        if (!this.node.active) {
            return;
        }

        this.setHolds(data.holds);
        let outs = data.outs;
        this.outsNode.getComponent('MjOutsNode').resetDatas(outs);

        let inPokers = data.inPokers;
        this.insNode.getComponent('MjInsNode').resetDatas(inPokers);
    },

    setHolds(holds, need) {
        this._holds = holds;
        if (!!need && Array.isArray(this._holds)) {
            let tingData = this._algorithm.checkTing(this._holds);
            cc.connect.emit('tingpai', tingData);
        }
    },

    sortHolds() {
        if (Array.isArray(this._holds)) {
            this._holds.sort((a, b) => {
                if (a == this._algorithm.laizi && b != this._algorithm.laizi) {
                    return 1;
                }
    
                if (a != this._algorithm.laizi && b == this._algorithm.laizi) {
                    return -1;
                }
    
                return b-a;
            });
        }
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
        if (Array.isArray(this._holds)) {
            this._tempHolds = [].concat(this._holds);
            if (need) {
                let rightValue = this._tempHolds.shift();
                this.mjScript(this.rightMjNode).showSortMjValue(rightValue, this.localSeat, -1, false);
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

            console.log('this._tempHolds = ', this._tempHolds, ' this._holdNodes.length = ', this._holdNodes.length);
            for (let i = 0; i < this._holdNodes.length; i++) {
                let mjNode = this._holdNodes[i];
                let v = this._tempHolds[i];
                if (isNaN(v)) {
                    mjNode.active = false;
                } else {
                    let v = this._tempHolds[i];
                    this.mjScript(mjNode).showSortMjValue(v, this.localSeat, i, ani);
                }
            }
        } else if (typeof this._holds == 'number') {
            this._tempHolds = this._holds;
            if (need) {
                this._tempHolds -= 1;
                this.mjScript(this.rightMjNode).showSortMjValue(-1, this.localSeat, -1, false);
            } else {
                this.rightMjNode.active = false;
            }

            for (let i = 0; i < this._holdNodes.length; i++) {
                let mjNode = this._holdNodes[i];
                if (i < this._tempHolds) {
                    this.mjScript(mjNode).showSortMjValue(-1, this.localSeat, i, ani);
                } else {
                    mjNode.active = false;
                }
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

        this.mjScript(this.rightMjNode).showSortMjValue(v, this.localSeat, -1, false);
        if (Array.isArray(this._holds)) {
            cc.connect.emit('tingpai');
        }
    },

    /**
     * 轮转
     * @param isTurn
     * @param gameStatus
     * @param disconnect
     */
    setTurn(isTurn, gameStatus, disconnect) {
        if (!this.node.active) {
            return;
        }

        this.showTurnNode(isTurn, gameStatus);
        this._can = false;
        if (!!disconnect) {
            if (isTurn) {
                if (gameStatus == cc.game_enum.status.DISCARD || gameStatus == cc.game_enum.status.DRAWCARDWAIT) {
                    this.showHolds(true, false);
                    if (Array.isArray(this._holds)) {
                        cc.connect.emit('tingpai');
                        if (gameStatus == cc.game_enum.status.DISCARD) {
                            this._can = true;
                        }
                    }
                } else {
                    this.showHolds(false, false);
                }
            } else {
                this.showHolds(false, false);
            }

            if (Array.isArray(this._holds)) {
                let need = false;
                if (this._holds.length%3 == 1) {
                    need = true;
                }
                if (!!need) {
                    let tingData = this._algorithm.checkTing(this._holds);
                    cc.connect.emit('tingpai', tingData);
                } else {
                    if (gameStatus == cc.game_enum.status.DISCARD) {
                        let holdsTing = this._algorithm.checkHoldsTing(this._holds);
                        this.checkHoldsTing(holdsTing);
                    }
                }
            }
        } else {
            if (isTurn && (gameStatus == cc.game_enum.status.DISCARD || gameStatus == cc.game_enum.status.DRAWCARDWAIT)) {
                if (Array.isArray(this._holds)) {
                    if (gameStatus == cc.game_enum.status.DISCARD) {
                        this._can = true;
                        let holdsTing = this._algorithm.checkHoldsTing(this._holds);
                        this.checkHoldsTing(holdsTing);
                    }
                }
            }
        }
    },

    /**
     * 检查手里打出可听牌的牌
     * @param {*} holdsTing 
     */
    checkHoldsTing(holdsTing=[]) {
        if (Array.isArray(this._holds)) {
            if (this.rightMjNode.active) {
                let r_mj_scr = this.mjScript(this.rightMjNode);
                let rightValue = r_mj_scr._value;
                r_mj_scr.showTipsting(holdsTing.includes(rightValue));
            }
    
            for (let i = 0; i < this._holdNodes.length; i++) {
                let mjCard = this._holdNodes[i];
                let mj_scr = this.mjScript(mjCard);
                if (mjCard.active && holdsTing.includes(mj_scr._value)) {
                    mj_scr.showTipsting(true);
                } else {
                    mj_scr.showTipsting(false);
                }
            }
        }
    },

    showTurnNode(show, gameStatus) {
        if (show && (gameStatus == cc.game_enum.status.DISCARD || gameStatus == cc.game_enum.status.DRAWCARDWAIT)) {
            if (!!this.turnNode) {
                this.turnNode.active = true;
                this.turnNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            }
        } else {
            if (!!this.turnNode) {
                this.turnNode.getComponent(sp.Skeleton).clearTracks();
                this.turnNode.active = false;
            }
        }
    },

    drawCard(info) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX("mj/drawcard.mp3");
        // if (info.v > 0) {
        //     cc.vv.audioMgr.playSFX('mj/'+this._sex+'/'+info.v+'.mp3');
        // }
        
        if (Array.isArray(this._holds)) {
            this._holds.unshift(info.v);
            cc.connect.emit('tingpai');
        } else if (typeof this._holds == 'number') {
            this._holds+=1;
        }

        this.rightMjNode.setPosition(this._rightPositions[this.localSeat]);
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        this._aniTimeOut = setTimeout(()=> {
            this.mjScript(this.rightMjNode).showSortMjValue(info.v, this.localSeat, -1, false);
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

    discard(info, disconnect) {
        if (!this.node.active) {
            return;
        }

        cc.vv.audioMgr.playSFX('mj/putcards.mp3');
        cc.vv.audioMgr.playSFX('mj/'+this._sex+'/'+info.v+'.mp3');

        this._discarding = false;
        this._can = false;
        this.checkHoldsTing();
        if (!!this._aniTimeOut) {
            clearTimeout(this._aniTimeOut);
        }

        let mjNode = this.outMJNode.getChildByName('mjNode');
        if (!!disconnect) {
            this.outMJNode.active = true;
            this.mjScript(mjNode).showTansMjValue(info.v);
        } else {
            this._aniTimeOut = setTimeout(()=> {
                this.outMJNode.active = true;
                this.mjScript(mjNode).showTansMjValue(info.v);
            }, 200);

            let start = undefined;
            if (isNaN(info.idx)) {
                let rightValue = this.mjScript(this.rightMjNode)._value;
                if (rightValue == info.v) {
                    start = this.rightMjNode.getNodeToWorldTransformAR();
                    this.rightMjNode.active = false;
                } else {
                    let from = 0;
                    let to = 0;
                    if (Array.isArray(this._tempHolds)) {
                        from = this._tempHolds.indexOf(info.v);
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
                    } else if (typeof this._tempHolds == 'number') {
                        from = Math.floor(Math.random()*this._tempHolds);
                        this._tempHolds-=1;
                        to = Math.floor(Math.random()*this._tempHolds);
                        this._tempHolds+=1;
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
            } else {
                if (info.idx > -1 && info.idx < this._holdNodes.length) {
                    let from = info.idx;
                    let to = 0;
                    if (Array.isArray(this._tempHolds)) {
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
                    } else if (typeof this._tempHolds == 'number') {
                        this._tempHolds-=1;
                        to = Math.floor(Math.random()*this._tempHolds);
                        this._tempHolds+=1;
                    }

                    let arr = this._holdNodes.splice(from, 1);
                    let mjNode = arr[0];
                    start = mjNode.getNodeToWorldTransformAR();
                    this._holdNodes.splice(to, 0, mjNode);
                    mjNode.opacity = 0;
                    setTimeout(() => {
                        mjNode.opacity = 255;
                    }, 200);
                } else {
                    start = this.rightMjNode.getNodeToWorldTransformAR();
                    this.rightMjNode.active = false;
                }
            }

            start = cc.p(start.tx, start.ty);
            /** 从手牌中移除这张牌 */
            if (Array.isArray(this._holds)) {
                let idx = this._holds.indexOf(info.v);
                if (idx > -1) {
                    this._holds.splice(idx, 1);
                }
            } else if (typeof this._holds == 'number') {
                this._holds -= 1;
            }
    
            this.showHolds(false, true);
            let end = this.outMJNode.getNodeToWorldTransformAR();
            end = cc.p(end.tx, end.ty);
            return {start: start, end: end};
        }
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
            if (Array.isArray(this._holds)) {
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
            } else if (typeof this._holds == 'number'){
                if (this._holds < 2) {
                    return;
                }

                this._holds-=1;
                if (this.rightMjNode.active) {
                    let start = this.rightMjNode.getNodeToWorldTransformAR();
                    start = cc.p(start.tx, start.ty);
                    starts.push(start);
                    this.rightMjNode.active = false;
                } else {
                    let idx = Math.floor(Math.random()*this._tempHolds);
                    this._tempHolds-=1;
                    let arr = this._holdNodes.splice(idx, 1);
                    let mjCard = arr[0];
                    let start = mjCard.getNodeToWorldTransformAR();
                    start = cc.p(start.tx, start.ty);
                    starts.push(start);
                    mjCard.active = false;
                    this._holdNodes.push(mjCard);
                }
            }
        }

        /** 最后检查右手那张牌还是不是显示的 如果是则找个正确的位置 */
        if (Array.isArray(this._holds) && this.rightMjNode.active) {
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

    actionHu(huType) {
        if (huType == cc.game_enum.huType.zimo) {
            this.rightMjNode.color = cc.hexToColor('#FFBBBB');
            cc.vv.audioMgr.playSFX('mj/'+this._sex+'/zimo'+cc.utils.getRandom(1,2)+'.mp3');
        } else {
            cc.vv.audioMgr.playSFX('mj/'+this._sex+'/dianpao'+cc.utils.getRandom(1,3)+'.mp3');
        }
    },

    dianpao(idx) {
        let colors = [cc.hexToColor('#BBBEFF'), cc.hexToColor('#FFE7BB'), cc.hexToColor('#FFBBBB')];
        let mjNode = this.outMJNode.getChildByName('mjNode');
        mjNode.color = colors[idx] || cc.Color.WHITE;
    },

    otherHolds(holds) {
        if (!this.node.active) {
            return;
        }

        this._holds = holds;
        this.showOtherHolds(this._holds.length%3 == 2);
    },

    /**
     * 显示手牌
     * @param {*} need 是否需要显示右手那张牌
     * @param {*} ani 是否需要显示动画
     */
    showOtherHolds(need=false, ani=false) {
        this.rightMjNode.setPosition(this._rightPositions[this.localSeat]);
        if (Array.isArray(this._holds)) {
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

            console.log('this._tempHolds = ', this._tempHolds);
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
        } else if (typeof this._holds == 'number') {
            this._tempHolds = this._holds;
            if (need) {
                this._tempHolds -= 1;
                this.mjScript(this.rightMjNode).showSortTansMjValue(-1, this.localSeat, -1, false);
            } else {
                this.rightMjNode.active = false;
            }

            for (let i = 0; i < this._holdNodes.length; i++) {
                let mjNode = this._holdNodes[i];
                if (i < this._tempHolds) {
                    this.mjScript(mjNode).showSortTansMjValue(-1, this.localSeat, i, ani);
                } else {
                    mjNode.active = false;
                }
            }
        }
    },

    mjScript(mj) {
        return mj.getComponent('mj');
    },

    /**
     * touch相关
     */
    onTouchStart: function (touch) {
        if (!Array.isArray(this._holds) || !this._can || !!this._discarding) {
            return;
        }

        this.startPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        this._moved = false;

        if (this.rightMjNode.getBoundingBox().contains(this.startPos)) {
            if (!this.rightMjNode.active) {
                return;
            }
            this._touchPoker = this.rightMjNode;
        } else {
            for (let i =0 ; i < this._holdNodes.length; i++) {
                let el = this._holdNodes[i];
                if (!el.active) {
                    continue;
                }
    
                if (el.getBoundingBox().contains(this.startPos)) {
                    this._touchPoker = el;
                    break;
                }
            }
        }
        if (!!this._touchPoker) {
            if (this._can) {
                let tingData = this._algorithm.checkTing(this._holds, this.mjScript(this._touchPoker)._value);
                cc.connect.emit('tingpai', tingData);
            }
            
            /** 将之前如果有单点的恢复变色和位置 */
            if (!!this._needOutPoker && this._needOutPoker != this._touchPoker) {
                let scr_needOut = this.mjScript(this._needOutPoker);
                scr_needOut.resetPositionAndZOrder();
                scr_needOut.setSelectStatus(false);
                this._needOutPoker = undefined;
            }
    
            let scr_touched = this.mjScript(this._touchPoker);
            scr_touched.setSelectStatus(true);
        }
    },

    onTouchMove: function (touch) {
        if (!Array.isArray(this._holds) || !this._can || !!this._discarding) {
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

        if (!!this._needOutPoker) {
            /** 恢复变色 */
            let scr_needOut = this.mjScript(this._needOutPoker);
            scr_needOut.setSelectStatus(false);
        }

        this._moved = true;
    },

    onTouchEnd: function (touch) {
        if (!Array.isArray(this._holds) || !this._can || !!this._discarding) {
            return;
        }

        /** 如果是点击或者双击 */
        if (!this._moved) {
            if (!!this._needOutPoker) {
                /** 出牌 */
                let scr_needOut = this.mjScript(this._needOutPoker);
                cc.connect.send('discard', {v: scr_needOut._value, idx: scr_needOut._idx});
                /** 恢复变色 */
                scr_needOut.setSelectStatus(false);
                this._needOutPoker = undefined;
                this._discarding = true;
            } else {
                this._needOutPoker = this._touchPoker;
                /** 变色 */
                let scr_needOut = this.mjScript(this._needOutPoker);
                scr_needOut.setSelectStatus(true);
                scr_needOut.setSelectY(true);
            }
            return;
        }

        this.endPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        this.touchEnd();
    },

    //连点  或滑动到手牌外
    touchEnd() {
        if(!!this._touchPoker) {
            let scr_touched = this.mjScript(this._touchPoker);
            if (this._can) {
                let tBound = this._touchPoker.getBoundingBox();
                console.log('tBound.y = ', tBound.y);
                if (tBound.y > 160) {
                    /** 出牌 */
                    cc.connect.send('discard', {v: scr_touched._value, idx: scr_touched._idx});
                    this._discarding = true;
                    scr_touched.setSelectStatus(false);
                    return;
                }
            }

            if (!!this._can) {
                cc.connect.emit('tingpai');
            }

            /** 回到原位 */
            this.resetTouchPoker();
        }
    },

    resetTouchPoker() {
        if(!!this._touchPoker) {
            let scr_touched = this.mjScript(this._touchPoker);
            scr_touched.resetPositionAndZOrder();
            scr_touched.setSelectStatus(false);
            this._touchPoker = undefined;
        }
    },
});
