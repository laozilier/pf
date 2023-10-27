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
        pokerPrefab: {
            default: null,
            type: cc.Prefab
        },

        outsPrefab: {
            default: null,
            type: cc.Prefab
        },
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        this._widthMargin = cc.find("Canvas").width-1334;
        this._holds = undefined;
        this._holdsNodes = [];
        
        this.holdsNode = this.node.getChildByName('holds');
        let outNodesPos = [cc.p(0, 320), cc.p(-380, -120), cc.p(380, -120)];
        let outsNode = cc.instantiate(this.outsPrefab);
        outsNode.setPosition(outNodesPos[this.localSeat]);
        this.node.addChild(outsNode, 0, 'outsNode');
        this.outsNode = outsNode;

        this.turnNode = this.userNode.getChildByName('turnNode');
        this.baodanNode = this.userNode.getChildByName('baodan');
        let clockAndCardNum = this.userNode.getChildByName('clockAndCardNum');
        this.cardNumNode = clockAndCardNum.getChildByName('cardNum');
        this.cardNumNode.active = false;
        this.cardNumNode.getChildByName('Label').getComponent(cc.Label).string = '';
        this.clockNode = clockAndCardNum.getChildByName('clock');
        this.clockFrame = this.clockNode.getComponent(cc.Sprite).spriteFrame;
        this.bankerNode = this.userNode.getChildByName('banker');  //庄家标签
        this.bankerNode.active = false;

        this.initHolds();
    },

    initHolds() {
        if (this.localSeat != 0) {
            return;
        }

        for (let i = 0; i < 16; i++) {
            let poker = cc.instantiate(this.pokerPrefab);
            if (poker) {
                poker.y = 0;
                this.holdsNode.addChild(poker);
                this._holdsNodes.push(poker);
                poker.active = false;
            }
        }
    },

    /**    获取选中牌的节点   */
    getTiqiList() {
        let list = [];
        this._holdsNodes.forEach((el)=> {
            if (el.active && this.pokerScript(el).isTiqi) {
                list.push(el);
            }
        });

        let values = [];
        list.forEach(function (el) {
            values.push(this.pokerScript(el).getValue());
        }.bind(this));


        return values;
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
        if (!this.node.active) {
            return;
        }

        let holds = data.holds;
        this.resetHolds(holds);
        this.setAlert(data.alert);
        this.showCardNum();
        this.setCardNum(data.num);
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
        this._holdsNodes.forEach((poker)=>{
            poker.active = false;
        });

        this.outsNode.getComponent('outCards').reset();
        this.baodanNode.active = false;
        this.cardNumNode.active = false;
        this.cardNumNode.getChildByName('Label').getComponent(cc.Label).string = '';
        this.bankerNode.active = false;

        this.stopClock();
        this.setAlert(false);
        this.setTurn(-1);

        this.resetStatus();
    },

    resetStatus() {
        this._touchPoker = null;
        this._types = null;
        this._type = 0;
        this._typeIdx = 0;
        this._nextAlert = null;
        this._startedTishi = false;
        this._needFresh = true;
        this._nextAlert = false;
    },

    compare(a, b) {
        let aa = a % 13;
        if (a % 13 === 0) {
            aa = 100;
        } else if (a % 13 === 1) {
            aa = 200;
        }
        let bb = b % 13;
        if (b % 13 === 0) {
            bb = 100;
        } else if (b % 13 === 1) {
            bb = 200;
        }
        return bb - aa;
    },

    /**
     * 重置手牌
     * @param holds
     */
    resetHolds(holds, count) {
        if (!this.node.active) {
            return;
        }

        if (this._gameStatus != cc.game_enum.status.SENDHOLDS && this._gameStatus != cc.game_enum.status.DISCARD) {
            return;
        }

        this._holds = holds;
        if (!this._holds) {
            return;
        }

        if (Array.isArray(this._holds)) {
            this._holds.sort(this.compare);
        }

        return this.checkHolds(count);
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
    checkHolds(count) {
        if (!this._holds) {
            return;
        }

        if (this._holdsNodes.length == 0) {
            return;
        }

        this._holdsNodes.forEach(function (poker) {
            poker.active = false;
        });

        let ends = [];
        if (typeof this._holds == 'number') {
            if (this._holds > 0) {
                let spacingX = Math.min(-130, Math.ceil(this._widthMargin/this._holds)+(16-this._holds)*4-160);
                this.holdsNode.getComponent(cc.Layout).spacingX = spacingX;
            }

            for (let i = 0; i < this._holds; i++) {
                let poker = this._holdsNodes[i];
                let poker_scr = this.pokerScript(poker);
                poker_scr.show();
                poker_scr.setTiqi(false, false);
                poker_scr.setCanThrow(true);
                if (count == 1) {
                    poker.opacity = 1;
                    setTimeout(() => {
                        poker.opacity = 255;
                    }, this._holds*85);
                } 
                let end = poker.getNodeToWorldTransformAR();
                end = cc.p(end.tx, end.ty);
                ends.push(end);
            }
        } else if (Array.isArray(this._holds)) {
            if (this._holds.length > 0) {
                let spacingX = Math.min(-130, Math.ceil(this._widthMargin/this._holds.length)+(16-this._holds.length)*4-160);
                this.holdsNode.getComponent(cc.Layout).spacingX = spacingX;
            }
            for (let i = 0; i < this._holds.length; i++) {
                let value = this._holds[i];
                let poker = this._holdsNodes[i];
                let poker_scr = this.pokerScript(poker);
                if (count == 1) {
                    poker_scr.show(value);
                    poker.opacity = 1;
                    poker_scr.isTiqi = false;
                    poker.y = 0;
                    setTimeout(() => {
                        poker.opacity = 255;
                    }, this._holds.length*85);
                } else if (count == 2) {
                    poker.active = true;
                    poker_scr.tran_ani(value);
                } else {
                    poker_scr.show(value);
                    poker_scr.setTiqi(false, false);
                }
                
                poker_scr.setCanThrow(true);
                let end = poker.getNodeToWorldTransformAR();
                end = cc.p(end.tx, end.ty);
                ends.push(end);
            }
        }

        return ends;
    },

    getHoldsPositons() {
        if (!this.node.active) {
            return;
        }

        let ends = [];
        for (let i = 0; i < this._holdsNodes.length; i++) {
            let poker = this._holdsNodes[i];
            if (!poker.active) {
                break;
            }

            let end = poker.getNodeToWorldTransformAR();
            end = cc.p(end.tx, end.ty);
            ends.push({p: end, v: this.pokerScript(poker).getValue()});
        }

        return ends;
    },

    // update (dt) {},

    setPlayerBanker(isBanker) {
        this.bankerNode.active = isBanker;
        if (isBanker) {
            this.bankerNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 设置报警
     * @param alert bool
     */
    setAlert(alert) {
        if (!this.node.active) {
            return;
        }

        this._alert = alert;
        this.baodanNode.active = alert;
        if (alert) {
            this.baodanNode.getComponent(cc.Animation).play("baodan");
        } else {
            this.baodanNode.getComponent(cc.Animation).stop();
        }
    },

    setCardNum(num) {
        if (!this.node.active) {
            return;
        }

        if (this._gameStatus != cc.game_enum.status.SENDHOLDS && this._gameStatus != cc.game_enum.status.DISCARD) {
            return;
        }
        
        if (num == undefined) {
            return;
        }

        if (this.localSeat == 0) {
            if (!Array.isArray(this._holds)) {
                this.resetHolds(num);
            }
        } else {
            this.cardNumNode.active = true;
            this.cardNumNode.getChildByName('Label').getComponent(cc.Label).string = num;
        }
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
        this._nextAlert = false;
    },

    showTurnNode(show) {
        this._clockTime = 30;
        this.stopClock();
        if (show) {
            this.turnNode.getComponent(sp.Skeleton).setAnimation(0, "animation", true);
            this.turnNode.active = true;

            this.clockNode.active = true;
            this.schedule(this.clockCountDown, 1);
            this.clockCountDown();
        }
    },

    stopClock() {
        this.unschedule(this.clockCountDown);
        this.clockNode.getComponent(cc.Animation).stop();
        this.clockNode.getComponent(cc.Sprite).spriteFrame = this.clockFrame;
        this.clockNode.active = false;

        this.turnNode.getComponent(sp.Skeleton).clearTracks();
        this.turnNode.active = false;
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
     * 显示最后剩下的牌
     * @param {*} cards 
     */
    showLoserCard(cards) {
        if (this._holdsNodes.length > 0) {
            this.resetHolds(cards);
        } else {
            this.outsNode.getComponent('outCards').showLoserCards(cards);
        }

        this.cardNumNode.active = false;
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
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/zhadan.mp3");
                    break;
                case cc.game_enum.cardsType.AABB: /** 连对 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/liandui.mp3");
                    break;
                case cc.game_enum.cardsType.ABC: /** 顺子 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/shunzi.mp3");
                    break;
                case cc.game_enum.cardsType.AAAABB: /** 四带二 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sidaier.mp3");
                    break;
                case cc.game_enum.cardsType.AAABBB: /** 飞机 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/feiji.mp3");
                    break;
                case cc.game_enum.cardsType.AAAABBB: /** 四带三 **/
                    cc.vv.audioMgr.playSFX("poker/"+this._sex+"/sidaier.mp3");
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
        this._moved = false;
        this._touchPoker = null;

        for (let i = this._holds.length - 1; i > -1; i--) {
            if (i >= this._holdsNodes) {
                continue;
            }

            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            if (el.getBoundingBox().contains(this.startPos)) {
                if (this.pokerScript(el).canThrow) {
                    this.pokerScript(el).setSelected(true);
                }
                this._touchPoker = el;
                break;
            }
        }
    },

    onTouchMove: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        this.endPos = this.holdsNode.convertTouchToNodeSpaceAR(touch);
        if (Math.abs(this.endPos.x - this.startPos.x) < 20) {
            return;
        }

        this._lastPoker = this._touchPoker;
        this._moved = true;
        let boundx = !!this._touchPoker ? this._touchPoker.getBoundingBox().x : this.startPos.x;
        for (let i = this._holds.length - 1; i > -1; i--) {
            if (i >= this._holdsNodes.length) {
                continue;
            }

            let el = this._holdsNodes[i];
            if (!el.active) {
                continue;
            }

            if (!this.pokerScript(el).canThrow) {
                continue;
            }

            if (el == this._touchPoker) {
                continue;
            }

            let bound = el.getBoundingBox();
            if (this.endPos.x > this.startPos.x) {
                if (bound.x < this.endPos.x && bound.x > boundx) {
                    this.pokerScript(el).setSelected(true);
                } else {
                    this.pokerScript(el).setSelected(false);
                }
            } else {
                if ((bound.x > this.endPos.x && bound.x < boundx) || bound.contains(this.endPos)) {
                    if (!!this._lastPoker && this._lastPoker.getBoundingBox().contains(this.endPos)) {
                        this.pokerScript(el).setSelected(false);
                    } else {
                        this.pokerScript(el).setSelected(true);
                        this._lastPoker = el;
                    }
                } else {
                    this.pokerScript(el).setSelected(false);
                }
            }
        }
    },

    onTouchEnd: function (touch) {
        if (!Array.isArray(this._holds)) {
            return;
        }

        if (this._moved) {
            let values = this.getTiqiList();
            this._holdsNodes.forEach((el)=> {
                if (el.active && this.pokerScript(el).canThrow) {
                    if (this.pokerScript(el).isSelected) {
                        this.pokerScript(el).setTiqi(!this.pokerScript(el).isTiqi, true);
                        this.pokerScript(el).setSelected(false);
                    }
                }
            });
            /** 如果没有提起的牌 */
            if (this._turn && values.length == 0) {
                this.getMaxLenCanOut();
            }
        } else {
            if (this._touchPoker && this.pokerScript(this._touchPoker).canThrow) {
                this.pokerScript(this._touchPoker).setTiqi(!this.pokerScript(this._touchPoker).isTiqi, true);
                this.pokerScript(this._touchPoker).setSelected(false);
            }
        }

        this._moved = false;
    },

    getMaxLenCanOut() {
        let values = this.getTiqiList();
        if (values.length < 2) {
            return;
        }

        let cards = this._algorithm.getMaxLenCanOut(values, this._holds);
        if (!!cards && cards.length > 0) {
            this._holdsNodes.forEach(el=> {
                let scr = this.pokerScript(el);
                if (!el.active || !scr.canThrow) {
                    return;
                }
                
                let v = scr.getValue();
                if (cards.includes(v)) {
                    scr.setTiqi(true);
                } else {
                    scr.setTiqi(false);
                }
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
            let cardsData = this._algorithm.checkCanOut(this._holds, cards, this._nextAlert);
            if (!!cardsData) {
                cc.connect.send("discard", cards);
                return true;
            }
        }

        return false;
    },

    checkTishi(alert, click) {
        this._nextAlert = alert;
        if (this._allTips == undefined) {
            if (!!this._algorithm.lastCards) {
                this._allTips = this._algorithm.findAutoBigCards(this._holds, alert);
            } else {
                this._allTips = this._algorithm.findAutoCards(this._holds, alert);
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

        let allCards = this._allTips.cards;
        let nots = this._allTips.nots;
        this._holdsNodes.forEach(el=> {
            if (!el.active) {
                return;
            }

            let scr = this.pokerScript(el);
            let v = scr.getValue();
            if (nots.includes(v)) {
                scr.setCanThrow(false);
            } else {
                scr.setCanThrow(true);
            }
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

            let scr = this.pokerScript(el);
            let v = scr.getValue();
            if (cards.includes(v)) {
                scr.setTiqi(true);
            } else {
                scr.setTiqi(false);
            }
        });

        this._tipsIdx+=1;
        if (this._tipsIdx >= allCards.length) {
            this._tipsIdx = 0;
        }
    },

    gameOver() {
        if (!this.node.active) {
            return;
        }
        /**  隐藏报单节点 **/
        this.baodanNode.active = false;
        this.stopClock();
    },

    onTable() {
        if (!this.node.active) {
            return;
        }
        if (this._uid == cc.dm.user.uid) {
            this._holdsNodes.forEach(function (el) {
                if (el.active) {
                    this.pokerScript(el).setTiqi(false, true);
                }
            }.bind(this));
        }
    },

});
