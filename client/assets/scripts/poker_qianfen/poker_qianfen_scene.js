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
    extends: require('../games/Game_scene'),

    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        cc.vv.audioMgr.playBGM("poker/public/bgm.mp3");

        let single = this.node.getChildByName('single');
        this.qieNode = single.getChildByName('qieNode');

        this.buheliNode = single.getChildByName('buheli');         //不合理
        this.buheliNode.active = false;

        let actNode =  single.getChildByName('actNode');      //所有游戏进程控制按钮父节点
        this.tishiBtn = actNode.getChildByName('btnTishi');
        this.chupaiBtn = actNode.getChildByName('btnChupai');

        this.tableScoreNode = single.getChildByName('tableScore');
        
        this.fapaiNode = single.getChildByName('fapaiNode');
        this.bottomCardsNode = single.getChildByName('bottomCards');

        this._isBackGround = false;
        cc.game.on(cc.game.EVENT_SHOW, this.foreGround, this);
        cc.game.on(cc.game.EVENT_HIDE, this.backGround, this);

        // this.intdicrads();
    },

    foreGround() {
        this._isBackGround = false;
    }, 

    backGround() {
        this._isBackGround = true;
    },

    onRoomInfo(data) {
        this._super(data);

        this.sceneNodesReset();
    },

    sceneNodesReset() {
        this.qieNode.getComponent('QieNode').closeQieNode();

        this.tishiBtn.active = false;
        this.chupaiBtn.active = false;
        this.fapaiNode.getComponent('FapaiNode').reset();
        this.tableScoreNode.getComponent('tableScore').reset();
        this.bottomCardsNode.getComponent('poker_qianfen_bottomCards').reset();

        this._settleData = null;

        //隐藏小结算
        let roundNode = this.node.getChildByName('roundNode');
        if (roundNode) {
            roundNode.getComponent('poker_qianfen_roundNode').reset(true);
        }

        //隐藏大结算
        let settleNode = this.node.getChildByName('settleNode');
        if (settleNode) {
            settleNode.getComponent('poker_qianfen_settleNode').reset(true);
        }

        this._algorithm.lastCards = undefined;
        this._cut_v = undefined;
        this._cut_uid = undefined;
    },

    /**
     * 游戏开始
     * @param data
     */
    gameBegin(data, need) {
        this._super(data, need);
        cc.vv.audioMgr.playSFX("poker/public/kaiju.mp3");
        this.sceneNodesReset();
    },

    /**
     * 询问切牌
     * @param {*} uid 
     */
    askcutCard(uid) {
        this.stopQie();
        cc.vv.audioMgr.playSFX("public/fapai.mp3");
        
        let str = "";
        let qieCallback = undefined;
        if (cc.dm.user.uid == uid) {
            str = "请切牌 ";
            qieCallback = ((v) => {
                cc.connect.send('cutCard', v);
            });
        } else {
            let playerData = this._model.getUserInfo(uid);
            if (!!playerData) {
                str = "等待 " + cc.utils.fromBase64(playerData.name, 6) + " 切牌 ";
            }
        }

        this.qieNode.getComponent('QieNode').openQieNode(uid, str, 5, qieCallback, 45);
    },

    /**
     * 停止切牌
     */
    stopQie() {
        this.qieNode.getComponent('QieNode').closeQieNode();
    },

    /***
     *  切牌
     * @param data
     */
    cutCard(data) {
        this._cut_v = data.card;
        this.bankerUid = data.uid;
        this.qieNode.getComponent('QieNode').qieValue(data.index, data.card);
    },

    /**
     *  断线重连游戏信息
     * @param data
     */
    gameInfo(data) {
        this._super(data);
        let banker = data.banker;
        if (banker > 0) {
            this.broadcastBanker(banker);
            /**显示底牌 */
            this.bottomCardsNode.getComponent('poker_qianfen_bottomCards').showBottomBg();
        }

        let lastCards = data.lastCards;
        if (!!lastCards) {
            this.discard(data.lastCards, true);
            data.isFirstDiscard = false;
        } else {
            data.isFirstDiscard = true;
        }

        this.turn(data);
    },

    /**
     * 状态切换
     * @param data
     */
    gameStatus(data) {
        this._super(data);
    },

    /**
     * 广播庄家
     * @param uid
     */
    broadcastBanker(uid) {
        this.bankerUid = uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            this.playerScript(p).setPlayerBanker(true);
        }
    },
    

    /***
     *  抓牌
     * @param data
     */
    holdArrays(data) {
        let holds = data.holds;
        this.stopQie();

        this.players.forEach((el, idx)=> {
            let scr_p = this.playerScript(el);
            let args = undefined;
            if (typeof this._cut_v == 'number' && this.bankerUid == scr_p._uid) {
                args = {v: this._cut_v};
            }
            
            if (idx == 0) {
                scr_p.resetHolds(holds, true);
                setTimeout(() => {
                    let ends = scr_p.getHoldsPositons(args);
                    if (!!args) {
                        args.s = 0.54;
                    }

                    if (Array.isArray(ends) && ends.length > 0) {
                        this.fapaiNode.getComponent('FapaiNode').showFapai1(ends, 0.54, args);
                    }
                }, 100);
            } else {
                setTimeout(() => {
                    let end = scr_p.showCardNum();
                    if (!!args) {
                        args.p = end;
                        args.s = 0.24;
                    }

                    if (end) {
                        this.fapaiNode.getComponent('FapaiNode').showFapai2(holds, end, 0.24, args);
                    }
                }, 100);

                setTimeout(() => {
                    let end = this.bottomCardsNode.getComponent('poker_qianfen_bottomCards').showBottomBg();
                    if (end) {
                        this.fapaiNode.getComponent('FapaiNode').showFapai3(6, end, 0.24);
                    }
                }, 1500);
            }
        });
    },

    /***
     *  轮转
     * @param data
     */
    turn(data) {
        this.stopQie();
        switch (this._gameStatus) {
            case cc.game_enum.status.CUT_CARD: 
                this.askcutCard(data.qieUid);
                break;
            case cc.game_enum.status.DISCARD: 
                this.players.forEach(el=> {
                    this.playerScript(el).setTurn(data.turn);
                });

                /** 如果是首出 清掉所有出的牌 */
                if (data.isFirstDiscard) {
                    this._algorithm.lastCards = undefined;
                    this.players.forEach(el=> {
                        this.playerScript(el).clearOutCards();
                    });

                    this.tableScoreNode.getComponent('tableScore').showNum(0, true);
                }

                /** 如果是自己 */
                if (cc.dm.user.uid == data.turn) {
                    this.tishiBtn.active = true;
                    this.chupaiBtn.active = true;
                    this.checkTishi();
                }

                break;
        }
    },

    /**
     * 出牌
     * @param data
     */
    discard(data, disconnect) {
        if (!data) {
            return;
        }

        if (!!this._algorithm.lastCards) {
            let uid = this._algorithm.lastCards.uid;
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let scr_p = this.playerScript(p);
                scr_p.clearOutCards();
            }
        }

        this._algorithm.lastCards = data;
        let uid = data.uid;
        if (uid == cc.dm.user.uid) {
            this.tishiBtn.active = false;
            this.chupaiBtn.active = false;
        }
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.discard(data, disconnect);
        } else {
            console.log('discard 玩家不见了 data = ', data);
        }

        let tableScore = data.tableScore;
        this.tableScoreNode.getComponent('tableScore').showNum(tableScore, true);
    },

    /**
     * 不要
     * @param data
     */
    pass(data) {
        let uid = data.uid;
        if (uid == cc.dm.user.uid) {
            this.chupaiBtn.active = false;
            this.tishiBtn.active = false;
        }
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.pass();
        }
    },

    /**
     * 上下游通知
     * @param data
     */
    rank(data) {
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let script = this.playerScript(p);
            let rank = data.rank;
            script.setRank(rank);
        }
    },

    /**
     * 积分同步
     * */
    asyncScore (data) {
        for (let uid in data) {
            let score = data[uid];
            if (typeof uid == 'string') {
                uid = parseInt(uid);
            }
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.setPlayerScore(score);
            }
        }
    },

    showBottomCards(cards) {
        this.bottomCardsNode.getComponent('poker_qianfen_bottomCards').openBottomCards(cards, this._algorithm);
        let score = this._algorithm.getCardScore(cards);
        this.tableScoreNode.getComponent('tableScore').showNum(score, true);
        this.players.forEach(el=> {
            this.playerScript(el).clearOutCards();
        });
    },

    /**
     * 游戏结果
     * @param data
     */
    gameResult (data) {
        this.tableScoreNode.getComponent('tableScore').showNum(0, true);
        this._myReady = false;
        this.tishiBtn.active = false;
        this.chupaiBtn.active = false;
        if(this.isPlaying()) {
            this.showRoundNode(data);
        }

        // if (data.isGameOver) {
        //     console.log('data.isGameOver = ', data.isGameOver);
        //     this.flyGolds(data);
        // }
    },

    showRoundNode(data) {
        let playerDatas = data.playerDatas;
        for (let uid in playerDatas) {
            let int_uid = parseInt(uid);
            let playerData = playerDatas[uid];
            let userInfo = this._model.getUserInfo(int_uid);
            playerData.name = userInfo.name;
            playerData.pic = userInfo.pic;
            playerData.sex = userInfo.sex;
            playerData.isBanker = (int_uid == this.bankerUid);
        }

        let roundNode = this.node.getChildByName('roundNode');
        if (roundNode) {
            roundNode.getComponent('poker_qianfen_roundNode').showRoundNode(playerDatas, data.timer, (timer)=> {
                if (data.isGameOver) {
                    data.timer = timer;
                    this.showSettelNode(data);
                } else {
                    this.onContinueBtnPressed();
                }
            });
        } else {
            cc.utils.loadPrefabNode('poker_qianfen/roundNode', (roundNode)=> {
                this.node.addChild(roundNode, 1, 'roundNode');
                roundNode.getComponent('poker_qianfen_roundNode').showRoundNode(playerDatas, data.timer, (timer)=> {
                    if (data.isGameOver) {
                        data.timer = timer;
                        this.showSettelNode(data);
                    } else {
                        this.onContinueBtnPressed();
                    }
                });
            });
        }
    },

    showSettelNode(data) {
        data.ante = this._model._game_rule.ante;
        data.rid = this._model._rid;
        data.currInning = this._model._currInning;
        data.lastInning = this._model._lastInning;
        data.inningLimit = this._model._inningLimit;

        let settleNode = this.node.getChildByName('settleNode');
        if (settleNode) {
            settleNode.getComponent('poker_qianfen_settleNode').showSettleNode(data, ()=> {
                this.onContinueBtnPressed();
            }, ()=> {
                this.onBackHallBtnPressed();
            });
        } else {
            cc.utils.loadPrefabNode('poker_qianfen/settleNode', (settleNode)=> {
                this.node.addChild(settleNode, 1, 'settleNode');
                settleNode.getComponent('poker_qianfen_settleNode').showSettleNode(data, ()=> {
                    this.onContinueBtnPressed();
                }, ()=> {
                    this.onBackHallBtnPressed();
                });
            });
        }
    },

    flyGolds(data) {
        let result = data.allScores;
        let zuid = data.winuid;//最后结算对比的uid
        let zp = this.getPlayerByUid(zuid);
        if (!!zp) {} else { return; }

        let zscr = this.playerScript(zp);
        let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
        let zScore = 0;     //庄家输赢分
        let wins = [];      //赢分玩家
        let loses = [];     //输分玩家
        
        Object.keys(result).forEach(key => {
            let uid = parseInt(key);
            if (uid == zuid) {
                return;
            }
            
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let ps = this.playerScript(p);
                let score = result[key];
                zScore -= score;
                let obj = {scr: ps, score: score};
                if (score > 0) {
                    wins.push(obj);
                } else if (score < 0) {
                    loses.push(obj);
                }
            }
        });

        if (loses.length > 0) {
            /** 闲家先出钱 */
            losesAni();
        } else {
            /** 闲家后进钱 */
            winsAni(true);
        }

        function losesAni() {
            loses.forEach((obj, i) => {
                obj.scr.showScore(obj.score);
                if (obj.scr._uid == cc.dm.user.uid) {
                    cc.vv.audioMgr.playSFX("public/lose.mp3");
                }
                let spos = obj.scr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                let epos = zscr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                let cb = null;
                if (i == loses.length-1) {
                    cb = (() => {
                        if (wins.length == 0) {
                            zscr.showScore(zScore);
                            zscr.playSaoGuang();
                            if (zscr._uid == cc.dm.user.uid) {
                                cc.vv.audioMgr.playSFX("public/sng_winner.mp3");
                            }
                        } else {
                            winsAni(false);
                        }
                    });
                }

                goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), self._isBackGround, cb);  
            });
        }
        
        function winsAni(noLoses) {
            if (noLoses) {
                zscr.showScore(zScore);
                if (zscr._uid == cc.dm.user.uid) {
                    cc.vv.audioMgr.playSFX("public/lose.mp3");
                }
            }

            wins.forEach((obj, i) => {
                let epos = obj.scr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                let spos = zscr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                let cb = null;
                if (i == wins.length-1) {
                    cb = (() => {
                        wins.forEach((obj) => {
                            obj.scr.showScore(obj.score);
                            obj.scr.playSaoGuang();
                            if (obj.scr._uid == cc.dm.user.uid) {
                                cc.vv.audioMgr.playSFX("public/sng_winner.mp3");
                            }
                        });

                        zscr.showScore(zScore);
                        if (zscr._uid == cc.dm.user.uid) {
                            if (zScore > 0) {
                                cc.vv.audioMgr.playSFX("public/sng_winner.mp3");
                            } else if (zScore < 0) {
                                cc.vv.audioMgr.playSFX("public/lose.mp3");
                            }
                        }
                    });
                }

                goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), self._isBackGround, cb);  
            });
        }
    },

    /**
     * 提示按钮点击
     */
    onTishiBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        this.checkTishi(true);
    },

    checkTishi(click) {
        this.playerScript(this.players[0]).checkTishi(click);
    },

    /**
     * 出牌按钮点击
     */
    onChupaiBtnPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (this.playerScript(this.players[0]).chupai()) {
        } else {
            this.buheliNode.active = true;
            setTimeout(() => {
                this.buheliNode.active = false;
            }, 1500);
        }
    },   
});

