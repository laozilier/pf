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
        singleHoldsPrefab: {
            default: null,
            type: cc.Prefab
        },

        outsPrefab: {
            default: null,
            type: cc.Prefab
        },

        rankFrames: {
            default: [],
            type: cc.SpriteFrame
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        this._holds = undefined;
        this._holdsNodes = [];

        this.holdsNode = this.node.getChildByName('holds');
        let outNodesPos = [cc.p(0, 360), cc.p(-420, -70), cc.p(420, -70)];
        let outsNode = cc.instantiate(this.outsPrefab);
        outsNode.setPosition(outNodesPos[this.localSeat]);
        this.node.addChild(outsNode, -1, 'outsNode');
        this.outsNode = outsNode;

        this.turnNode = this.userNode.getChildByName('turnNode');

        let clockAndCardNum = this.userNode.getChildByName('clockAndCardNum');
        this.cardNumNode = clockAndCardNum.getChildByName('cardNum');
        this.cardNumNode.active = false;
        this.clockNode = clockAndCardNum.getChildByName('clock');
        if (!this.clockNode) {
            this.clockNode = this.node.getChildByName('clock');
        }
        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;
        this.bankerNode = this.userNode.getChildByName('banker');  //庄家标签
        this.bankerNode.active = false;
        this.rankNode =  this.userNode.getChildByName('rank');    //上中下游
        this.rankPositions = [cc.p(150, 8),cc.p(-350, 48),cc.p(350, 48)];

        let gameScoreNode = this.userNode.getChildByName('gameScore');          //所有积分控制节点
        this.roundScoreNode =  gameScoreNode.getChildByName('roundScore');      //回合积分
        this.totalScoreNode =  gameScoreNode.getChildByName('totalScore');      //总积分
        this.xiScoreNode =  gameScoreNode.getChildByName('xiScore');            //喜分
        this.totalXiScoreNode =  gameScoreNode.getChildByName('totalXiScore');  //总喜分
        this.initHolds();
    },

    initHolds() {
        if (this.localSeat != 0) {
            return;
        }

        for (let i = 0; i < 11; i++) {
            let el = cc.instantiate(this.singleHoldsPrefab);
            this.holdsNode.addChild(el, i, 'singleHolds'+i);
            el.getComponent('singleHolds').reset();
            this._holdsNodes.push(el);
        }
    },

    start() {
        if (this.localSeat == 0) {
            console.log(" 注册触摸事件！！！！ ");
            this.holdsNode.on(cc.Node.EventType.TOUCH_START, this.onTouchStart, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_END, this.onTouchEnd, this);
            this.holdsNode.on(cc.Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
            this.startPos = null;
            this.endPos = null;
        }
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
        this.resetHolds(holds);
        this.setPlayerScore(data);
        let rank = data.rank;
        this.setRank(rank);
    },

    /**
     * 设置玩家积分数据  断线重连后
     * @param data
     */
    setPlayerScore(data) {
        if (!this.node.active ) {
            return;
        }

        this.totalScoreNode.getComponent(cc.Label).string = data.totalScore;
        this.roundScoreNode.getComponent(cc.Label).string = data.roundScore;
        this.totalXiScoreNode.getComponent(cc.Label).string = data.totalXiScore;
        this.xiScoreNode.getComponent(cc.Label).string = data.xiScore;
    },

    /**
     * 设置玩家庄 断线重连后
     * @param isBanker
     */
    setPlayerBanker(isBanker) {
        if (!this.node.active ) {
            return;
        }

        this.bankerNode.active = isBanker;
        if (isBanker) {
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 设置玩家上中下游戏 断线重连后
     * @param rank
     */
    setRank(rank) {
        if (!this.node.active ) {
            return;
        }

        this.rankNode.stopAllActions();
        if (typeof rank == 'number') {
            this.rankNode.active = true;
            this.rankNode.getComponent(cc.Sprite).spriteFrame = this.rankFrames[rank];
            let p = this.outsNode.getNodeToWorldTransformAR();
            p = cc.p(p.tx, p.ty);
            p = this.userNode.convertToNodeSpaceAR(p);
            this.rankNode.setPosition(p);
            this.rankNode.opacity = 80;
            this.rankNode.scale = 2;
            this.rankNode.runAction(cc.sequence(
                cc.spawn(cc.scaleTo(0.2, 0.9), cc.fadeTo(0.2, 255)),
                cc.scaleTo(0.1, 1.1),
                cc.scaleTo(0.05, 1),
                cc.moveTo(0.3, this.rankPositions[this.localSeat])
            ));
        } else {
            this.rankNode.active = false;
        }
    },

    gameBegin() {
        this._super();
    },

    /**
     * 重置所有节点
     */
    resetNodes() {
        if (!this.node.active) {
            return;
        }

        this._super();

        this._holds = undefined;
        this.outsNode.getComponent('outCards').reset();

        this._holdsNodes.forEach((el)=>{
            el.getComponent('singleHolds').reset();
        });


        this.stopClock();
        this.setTurn(-1);
        this.setPlayerBanker(false);
        this.showCardNum();

        this.setRank();

        this.resetStatus();
    },

    resetStatus() {
        this._touchPoker = null;
    },

    /**
     * 重置手牌
     * @param holds
     */
    resetHolds(holds, need) {
        this._holds = holds;
        this.checkHolds(need);
    },

    showCardNum() {
        if (!this.node.active) {
            return;
        }
        
        if (this.localSeat == 0) {
            return;
        }

        this.cardNumNode.active = true;
        let end = this.cardNumNode.getNodeToWorldTransformAR();
        end = cc.p(end.tx, end.ty);
        return end;
    },

    /**
     * 检查手牌
     */
    checkHolds(need) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        let sortCards = this.getSortCards();
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let singleHolds = this._holdsNodes[i];
            if (i < sortCards.length) {
                singleHolds.active = true;
                let cards = sortCards[i];
                singleHolds.getComponent('singleHolds').checkSingleHolds(cards, !!need ? (this._holds.length-1) : undefined);
            } else {
                singleHolds.active = false;
            }
        }
    },

    getHoldsPositons(args) {
        if (!this.node.active) {
            return;
        }

        let ends = [];
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let el = this._holdsNodes[i];
            if (!el.active) {
                break;
            }

            ends = ends.concat(el.getComponent('singleHolds').getHoldsPositons(args));
        }

        return ends;
    },

    getSortCards() {
        if (!Array.isArray(this._holds)) {
            return [];
        }

        let sortCards = [];
        let cardsMap = this._algorithm.getCardsMap(this._holds);
        let keys = Object.keys(cardsMap);
        this._algorithm.sortDown(keys);
        for (let i = 0; i < keys.length; i++) {
            let key = keys[i];
            let cards = cardsMap[key];
            sortCards.push(cards);
        }

        return sortCards;
    },

    /**
     * 轮转
     * @param turnSeatId
     */
    setTurn(turnUid) {
        if (!this.node.active) {
            return;
        }

        this._turn = (turnUid == this._uid);
        this.showTurnNode(this._turn);
        this._allTips = undefined;
    },

    showTurnNode(show) {
        this._clockTime = 30;
        this.stopClock();
        if (show && this.turnNode) {
            this.turnNode.active = true;
            this.turnNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            this.clockNode.active = true;
            this.schedule(this.clockCountDown, 1);
            this.clockCountDown();
        }
    },

    stopClock() {
        if(!!this.turnNode) {
            this.unschedule(this.clockCountDown);
            this.clockNode.getComponent(cc.Animation).stop();
            this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
            this.clockNode.active = false;

            this.turnNode.getComponent(sp.Skeleton).clearTracks();
            this.turnNode.active = false;
        }

    },

    clockCountDown() {
        if (this._clockTime < 0) {
            this.unschedule(this.clockCountDown);
            return;
        }

        if (this._clockTime == 3) {
            //播放时间不够声音
            this.clockNode.getComponent(cc.Animation).play('naozhong');
            cc.vv.audioMgr.playSFX("public/timeup_alarm.mp3");
        }

        this.clockNode.getChildByName('Label').getComponent(cc.Label).string = this._clockTime;
        this._clockTime -= 1;
    },

    /**
     * 出牌成功
     * @param {*} cardsData 
     * @param {*} disconnect 
     */
    discard(cardsData, disconnect) {
        cc.vv.audioMgr.playSFX("public/shuaipai.wav");
        this.setTurn();
        this.clearOutCards();
        let cards = cardsData.cards;
        let type = cardsData.type;
        let startp = this.holdsNode.getNodeToWorldTransformAR();
        startp = cc.p(startp.tx, startp.ty);
        this.outsNode.getComponent('outCards').openOutCards(cardsData, startp);
        if (!disconnect && Array.isArray(this._holds)) {
            cards.forEach(v=> {
                let idx = this._holds.indexOf(v);
                if (idx > -1) {
                    this._holds.splice(idx, 1);
                }
            });
        }

        if (cardsData.h_len == 0) {
            this.cardNumNode.active = false;
        }
        this.checkHolds();
        this.playSound(type, cards);
    },

    /**
     * 不要
     */
    pass() {
        let num = Math.floor(Math.random()*4)+1;
        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/buyao"+num+".mp3");
        this.outsNode.getComponent('outCards').openOutCards({type: 0, cards: []});
    },

    /**
     * 清除出的牌
     */
    clearOutCards() {
        if (!this.node.active) {
            return;
        }

        this.outsNode.stopAllActions();
        this.outsNode.getComponent('outCards').reset();
    },

    /**
     * 播放声音
     * @param type
     * @param cards
     */
    playSound(type, cards) {
        if (!!type) {
            this.chatNode.active = false;
            let card = cards[0];
            let a = card % 13 + 1;
            switch (type) {
                /** 出单 **/
                case cc.game_enum.cardsType.A: {
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/"+a+".mp3");
                }
                    break;
                /** 出双 **/
                case cc.game_enum.cardsType.AA: {
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/dui"+a+".mp3");
                }
                    break;
                case cc.game_enum.cardsType.AAABB: /** 三个 **/
                    if (cards.length === 5) {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sandaier.mp3");
                    } else if (cards.length === 4) {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sandaiyige.mp3");
                    } else {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sange.mp3");
                        setTimeout(() => {
                            cc.vv.audioMgr.playSFX("poker/"+this._sex+"/"+a+".mp3");
                        }, 200);
                    }
                    break;
                case cc.game_enum.cardsType.AAAA: /** 炸弹 **/
                    cc.vv.audioMgr.playSFX("poker/public/zhadan.mp3");
                    if (cards.length > 4) {
                        cc.vv.audioMgr.playSFX("poker/qianfen/"+this._sex+"/poker_14_"+cards.length+".mp3");
                    } else {
                        cc.vv.audioMgr.playSFX("poker/"+this._sex+"/zhadan.mp3");
                    }
                    
                    break;
                case cc.game_enum.cardsType.AABB: /** 连对 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/liandui.mp3");
                    break;
                case cc.game_enum.cardsType.ABC: /** 顺子 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/shunzi.mp3");
                    break;
                case cc.game_enum.cardsType.AAABBB: /** 飞机 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/feiji.mp3");
                    break;
            }
        } else {
            let num = Math.floor(Math.random()*4)+1;
            cc.vv.audioMgr.playSFX("poker/"+this._sex+"/buyao"+num+".mp3");
        }
    },

    /**
     * touch相关
     */
    onTouchStart: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }
        this.startPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        let startp = this.holdsNode.convertToWorldSpaceAR(this.startPos);
        this._moved = false;
        this._touch_el = undefined;
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            el.getComponent('singleHolds').checkTouchStart(startp);
        }
    },

    onTouchMove: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        this.endPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        if (Math.abs(this.endPos.x - this.startPos.x) < 20 && Math.abs(this.endPos.y - this.startPos.y) < 20) {
            return;
        }
        
        let endp = this.holdsNode.convertToWorldSpaceAR(this.endPos);
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            el.getComponent('singleHolds').checkTouchMove(endp);
        }

        this._moved = true;
    },

    onTouchEnd: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        let values = this.getTiqiList();
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            el.getComponent('singleHolds').checkTouchEnd();
        }

        /** 如果没有提起的牌 */
        if (this._turn && values.length == 0) {
            this.getMaxLenCanOut();
        }

        this._moved = false;
    },

    getTiqiList() {
        let cards = [];
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            cards = cards.concat(el.getComponent('singleHolds').getTiqiList());
        }

        return cards;
    },

    getMaxLenCanOut() {
        let values = this.getTiqiList();
        if (values.length < 2) {
            return;
        }

        let cards = this._algorithm.getMaxLenCanOut(values, this._holds);
        if (!!cards && cards.length > 0) {
            this._holdsNodes.forEach(el=> {
                if (!el.active) {
                    return;
                }
                el.getComponent('singleHolds').checkTiqi(cards);
            });
        }
    },

    /**
     * 出牌  每次出牌客户端会做检查
     * @return {boolean}
     */
    chupai() {
        let cards = this.getTiqiList();
        if (cards.length > 0) {
            let cardsData = this._algorithm.checkCanOut(this._holds, cards);
            if (!!cardsData) {
                cc.connect.send('discard', cards);
                return true;
            }
        }

        return false;
    },

    checkTishi(click) {
        if (this._allTips == undefined) {
            if (!!this._algorithm.lastCards) {
                this._allTips = this._algorithm.findAutoBigCards(this._holds);
            } else {
                this._allTips = this._algorithm.findAutoCards(this._holds);
            }

            this._tipsIdx = 0;
        }
        
        this.nextTishi(click);
    },


    /**
     * 提示
     */
    nextTishi(click) {
        if (!this._allTips) {
            return;
        }

        if (!click) {
            let values = this.getTiqiList();
            if (values.length > 0) {
                return;
            }
        }

        let allCards = this._allTips.cards;
        let nots = this._allTips.nots;
        this._holdsNodes.forEach(el=> {
            if (!el.active) {
                return;
            }

            el.getComponent('singleHolds').resetStatus();
            el.getComponent('singleHolds').checkCanThrow(nots);
        });

        if (!click && allCards.length > 1) {
            return;
        }

        let cards = allCards[this._tipsIdx];
        if (!Array.isArray(cards)) {
            return;
        }
        this._holdsNodes.forEach(el=> {
            if (!el.active) {
                return;
            }
            el.getComponent('singleHolds').checkTiqi(cards);
        });

        this._tipsIdx+=1;
        if (this._tipsIdx >= allCards.length) {
            this._tipsIdx = 0;
        }
    },

    onTable() {
        if (!this.node.active) {
            return;
        }
        if (this._uid == cc.dm.user.uid) {
            this._holdsNodes.forEach(function (el) {
                if (el.active) {
                    el.getComponent('singleHolds').resetStatus();
                }
            }.bind(this));
        }
    },

    onDestory() {
        this.stopClock();
    },
});
