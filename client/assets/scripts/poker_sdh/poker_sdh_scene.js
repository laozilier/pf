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

        this.tipsNode = single.getChildByName('game_tips');    //状态提示
        this.actNode = single.getChildByName('actNode');        //所有游戏进程控制按钮父节点
        this.tishiBtn = this.actNode.getChildByName('btnTishi');            //提示
        this.tishiBtn.active = false;
        this.chupaiBtn = this.actNode.getChildByName('btnChupai');          //出牌
        this.chupaiBtn.active = false;

        this.btnCheckLast = single.getChildByName('btnCheckLast');                                             //查看上手牌
        this.btnCheckLast.active = false;

        this.liujuNode = single.getChildByName('liuju');                                           //流局dongz
        this.liujuNode.active = false;

        this.wanjiatoux = single.getChildByName('wanjiatoux'); 
        this.wanjiatoux.active = false;

        this.paiNode = single.getChildByName('pai'); 
        this.paiNode.active = false;

        this.poNode = single.getChildByName('po'); 
        this.poNode.active = false;

        this.zaipoNode = single.getChildByName('zaipo'); 
        this.zaipoNode.active = false;

        this.fapaiNode = single.getChildByName('fapaiNode');
        this.liangzhuNode = single.getChildByName('poker_liangzhu');
        this.aniNode = single.getChildByName('poker_ani');
        this.bottomCardsNode = single.getChildByName('bottomCards');

        this.tableScoreNode = single.getChildByName('tableScore');

        this.callinfo =  single.getChildByName('poker_sdh_callinfo');
        this.getScoreNode = single.getChildByName('poker_getScore');

        this._isBackGround = false;
        cc.game.on(cc.game.EVENT_SHOW, this.foreGround, this);
        cc.game.on(cc.game.EVENT_HIDE, this.backGround, this);
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

    //场景重置
    sceneNodesReset() {
        this.qieNode.getComponent('QieNode').closeQieNode();
        //亮主信息
        this.liangzhuNode.getComponent('poker_liangzhu').reset();
        this.aniNode.getComponent('poker_ani').reset();
        this.tipsNode.getComponent('game_tips').reset();

        this.tishiBtn.active = false;
        this.chupaiBtn.active = false;

        this.buheliNode.active = false;     //不符合规则
        this.liujuNode.getComponent(cc.Animation).stop();
        this.liujuNode.active = false;

        this.wanjiatoux.getComponent(cc.Animation).stop();
        this.wanjiatoux.active = false;

        this.paiNode.active = false;
        this.poNode.active = false;
        this.zaipoNode.active = false;

        let lastNode = this.node.getChildByName('lastNode');
        if (!!lastNode) {
            lastNode.getComponent('lastDiscards').closeLastDiscards();
        }

        this.callinfo.getComponent('poker_sdh_callinfo').reset();
        this.bottomCardsNode.getComponent('poker_sdh_bottomCards').reset();

        this.resetTableScoreNode();
        this.getScoreNode.getComponent('poker_getScore').reset();
        
        this.btnCheckLast.active = false;

        this._algorithm.firstCards = undefined;
        this._algorithm.maxCards = undefined;
        this._algorithm.zhuType = undefined;
    },

    resetTableScoreNode() {
        this.tableScoreNode.stopAllActions();
        this.tableScoreNode.opacity = 255;
        this.tableScoreNode.y = 60;
        this.tableScoreNode.getComponent(cc.Label).string = '';
    },

    /**
     * 游戏开始
     * @param data
     */
    gameBegin(data) {
        this._super(data);

        cc.vv.audioMgr.playSFX("poker/public/kaiju.mp3");
        this.sceneNodesReset();
    },

    /**
     * 切牌开始
     */
    qieStart(uid) {
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

        this.qieNode.getComponent('QieNode').openQieNode(uid, str, 5, qieCallback);
    },

    /**
     * 停止切牌
     */
    stopQie() {
        this.qieNode.getComponent('QieNode').closeQieNode();
    },

    /**
     * 切了哪张牌
     * @param value
     */
    qieValue(value) {
        this.qieNode.getComponent('QieNode').qieValue(value);
    },

    /**
     *  断线重连游戏信息
     * @param data
     */
    gameInfo(data) {
        this._super(data);

        let banker = data.banker;
        if (banker != undefined) {
            this.broadcastBanker(banker);
        }

        this._diLen = data.diLen;
        this._surrendered = data.surrendered;
        this.callinfo.getComponent('poker_sdh_callinfo').checkData(data);

        if (this._gameStatus == cc.game_enum.status.JIAOFEN) {
            this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showBottomCards(this._diLen);
        }

        if (this._gameStatus == cc.game_enum.status.DISCARD) {
            this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showMaidiBottomCards(this._diLen);
        }

        let isFirstDiscard = true;
        if (!!this.bankerUid) {
            let zhuType = data.zhuType;
            if (zhuType != undefined) {
                this._algorithm.zhuType = zhuType;
                let p = this.getPlayerByUid(cc.dm.user.uid);
                if (!!p) {
                    let scr_p = this.playerScript(p);
                    scr_p.checkHolds();
                }
            }

            let xianScore = data.xianScore;
            let allScoreCards = data.allScoreCards;
            this.getScoreNode.getComponent('poker_getScore').checkData(xianScore, allScoreCards);

            /** 桌面分数 */
            let tableScore = data.tableScore || 0;
            /** 当前这一轮牌 */
            let curDiscards = data.curDiscards;
            if (!!curDiscards && curDiscards.length > 0) {
                isFirstDiscard = (curDiscards.length == 0);
                for (let i = 0; i < curDiscards.length; i++) {
                    this.discard({cardsData: curDiscards[i], tableScore: tableScore}, true);
                }
            }

            let lastDiscards = data.lastDiscards;
            if(!!lastDiscards && lastDiscards.length > 0) {                                //上一轮牌数据
                this.lastDiscards(data.lastDiscards);
            }
        }
        
        data.isFirstDiscard = isFirstDiscard;
        this.turn(data);
    },

    /**
     * 状态切换
     * @param data
     */
    gameStatus(data, disconnect) {
        this._super(data, disconnect);

        this.tipsNode.getComponent('game_tips').reset();
        if (!disconnect) {
            if (this._gameStatus == cc.game_enum.status.DINGZHU) {
                this.showDingzhu();
            }
    
            if (this._gameStatus == cc.game_enum.status.MAIDI) {
                this.showMaidi();
            }
        }

        if (this._gameStatus == cc.game_enum.status.LIUJU) {
            this.liujuNode.active = true;
            this.liujuNode.getComponent(cc.Animation).play();
        }

        if(this._gameStatus == cc.game_enum.status.SURRENDER) {
            this.liangzhuNode.getComponent('poker_liangzhu').reset();
            
            this.wanjiatoux.active = true;
            this.wanjiatoux.getComponent(cc.Animation).play();

            if (!disconnect) {
                if (this.isPlaying() && cc.dm.user.uid != this.bankerUid) {
                    this.showReplySurrender();
                } else {
                    this.tipsNode.getComponent('game_tips').openTips('等待玩家选择是否同意庄家投降', 15, -140);
                }
            }
        }
    },

    /***
     *  轮转
     * @param data
     */
    turn(data) {
        switch (this._gameStatus) {
            case cc.game_enum.status.CUT_CARD: 
                if (!!data.qieUid) {
                    this.qieStart(data.qieUid);
                }
                
                break;
            case cc.game_enum.status.JIAOFEN: 
                this.players.forEach(el=> {
                    let scr_p = this.playerScript(el);
                    scr_p.setTurn(data.turn, 15);
                    if (scr_p._uid == data.turn) {
                        scr_p.jiaofen();
                    }
                });

                if (data.turn == cc.dm.user.uid) {
                    /**显示叫分面板*/
                    this.showJiaofen(data);       
                } else {
                    this.tipsNode.getComponent('game_tips').openTips('等待玩家叫分', 15, -120);
                }

                break;
            case cc.game_enum.status.DINGZHU: 
                this.showDingzhu();
                
                break;
            case cc.game_enum.status.MAIDI: 
                this.showMaidi();
                
                break;
            case cc.game_enum.status.LIUSHOU: 
                this.players.forEach(el=> {
                    let scr_p = this.playerScript(el);
                    scr_p.setTurn(data.turn, 15);
                });
                this.showLiushou(data.turn);

                break;
            case cc.game_enum.status.DISCARD: 
                this.players.forEach(el=> {
                    this.playerScript(el).setTurn(data.turn, 30);
                });

                /** 如果是首出 清掉所有出的牌 */
                if (data.isFirstDiscard) {
                    this._algorithm.firstCards = undefined;
                    this._algorithm.maxCards = undefined;
                    this.players.forEach(el=> {
                        this.playerScript(el).clearOutsNode();
                    });
                }

                /** 如果是自己 */
                if (cc.dm.user.uid == data.turn) {
                    this.tishiBtn.active = true;
                    this.chupaiBtn.active = true;
                    this.playerScript(this.players[0]).checktishi(true);
                }
                break;
            case cc.game_enum.status.SURRENDER:
                let dataPlayers = data.players;
                if (!!dataPlayers) {
                    let me = dataPlayers[cc.dm.user.uid];
                    if (!!me && !!me.canReply) {
                        this.showReplySurrender();
                    } else {
                        this.tipsNode.getComponent('game_tips').openTips('等待玩家选择是否同意庄家投降', 15, -140);
                    }
                }
                break;
            
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
            if (!el.active) {
                return;
            }
            if (idx == 0) {
                this.playerScript(el).resetHolds(holds, true);
                setTimeout(() => {
                    let ends = this.playerScript(el).getHoldsPositons();
                    if (Array.isArray(ends) && ends.length > 0) {
                        this.fapaiNode.getComponent('FapaiNode').showFapai1(ends, 0.56);
                    }
                }, 100);
            } else {
                let end = el.getChildByName('user').getNodeToWorldTransformAR();
                if (!!end) {
                    setTimeout(() => {
                        end = cc.p(end.tx, end.ty);
                        this.fapaiNode.getComponent('FapaiNode').showFapai2(holds, end, 0.24);
                    }, 100);
                }
            }
        });

        this._diLen = data.diLen;
        this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showBottomCards(this._diLen);
    },

    /**
     * 出牌
     * @param data
     */
    discard(data, disconnect) {
        if (!data) {
            return;
        }

        /** 第一手牌 */
        let cardsData = data.cardsData;
        if (!!cardsData.first) {
            this._algorithm.firstCards = cardsData;
        }

        /** 最大一手牌 */
        if (!!cardsData.max) {
            if (!!this._algorithm.maxCards && this._algorithm.maxCards.uid != cardsData.uid) {
                let p = this.getPlayerByUid(this._algorithm.maxCards.uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.hideMaxCard();
                }
            }
            this._algorithm.maxCards = cardsData;
        }

        let uid = cardsData.uid;
        if (uid == cc.dm.user.uid) {
            this.tishiBtn.active = false;
            this.chupaiBtn.active = false;
        }

        if (!!data.tableScore) {
            this.resetTableScoreNode();
            this.tableScoreNode.getComponent(cc.Label).string = data.tableScore+'A';
        }

        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.discard(cardsData, disconnect);
        }
    },

    /**
     * 亮底
     * @param data
     * */
    liangdi(data) {
        this.players.forEach(el=> {
            let scr_p = this.playerScript(el);
            scr_p.gameOver();
        });

        this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showLiangdiBottomCards(data, this._algorithm);
        if (!!data.score) {
            setTimeout(() => {
                this.xianScore(data, true);
            }, 2000);
        }
    },

    /**
     * 游戏结果
     * @param data
     */
    gameResult(data) {
        this._myReady = false;
        this.tishiBtn.active = false;
        this.chupaiBtn.active = false;

        let playerDatas = [];
        for (let key in data.allScore) {
            let uid = parseInt(key);
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.gameOver();
            }
            
            let obj = {};
            let userInfo = this._model.getUserInfo(uid);
            obj.name = userInfo.name;
            obj.pic = userInfo.pic;
            obj.sex = userInfo.sex;
            obj.score = data.allScore[key];
            obj.uid = uid;
            if (uid == this.bankerUid) {
                playerDatas.unshift(obj);
            } else {
                playerDatas.push(obj);
            }
        }

        if (this.isTourist()) return;
        this.startEndnode(15);
        delete data.allScore;
        data.playerDatas = playerDatas;
        let settleNode = this.endNode.getChildByName('settleNode');
        if (settleNode) {
            settleNode.getComponent('poker_sdh_settleNode').openSettleNode(data);
        } else {
            cc.utils.loadPrefabNode('poker_sdh/settleNode', function (settleNode) {
                this.endNode.addChild(settleNode, -1, 'settleNode');
                settleNode.getComponent('poker_sdh_settleNode').openSettleNode(data);
            }.bind(this));
        }
    },

    /**
     * 提示按钮点击
     */
    onTishiBtnPressed(event) {
        if (!!event) {
            cc.vv.audioMgr.playButtonSound();
        }
        
        this.playerScript(this.players[0]).tishi();
    },

    /**
     * 询问切牌
     * @param {*} uid 
     */
    askcutCard(uid) {
        this.qieStart(uid);
    },

    /***
     *  切牌
     * @param data
     */
    qieCard(data) {
        this.qieValue(data.index);
    },

    /**
     * 上一轮牌
     * @param data
     * */
    lastDiscards(data) {
        this._lastDiscards = data;
        this.btnCheckLast.active = (!!this._lastDiscards && this._lastDiscards.length > 0);
        for (let i = 0; i < this._lastDiscards.length; i++) {
            let cardsData = this._lastDiscards[i];
            let uid = cardsData.uid;
            let player = this.getPlayerByUid(uid);
            let outsNode = player.getChildByName('outsNode');
            let p = outsNode.getNodeToWorldTransformAR();
            p = cc.p(p.tx, p.ty);
            cardsData.p = p;
        }

        let lastNode = this.node.getChildByName('lastNode');
        if (!!lastNode) {
            lastNode.getComponent('lastDiscards').closeLastDiscards();
        }
    },

    /**
     *显示玩家叫分
     * @param data
     */
    showJiaofen(data) {
        this.tipsNode.getComponent('game_tips').reset();
        let jiaofenNode = this.node.getChildByName('jiaofenNode');
        if (jiaofenNode) {
            jiaofenNode.getComponent('poker_sdh_jiaofen').showJiaofenNode(data, (idx, isPai)=> {
                cc.connect.send('jiaofen',{idx: idx, pai: isPai});
            });
        } else {
            cc.utils.loadPrefabNode('poker_sdh/jiaofen', function (jiaofenNode) {
                this.node.addChild(jiaofenNode, 99, 'jiaofenNode');
                jiaofenNode.getComponent('poker_sdh_jiaofen').showJiaofenNode(data, (idx, isPai)=> {
                    cc.connect.send('jiaofen',{idx: idx, pai: isPai});
                });
            }.bind(this));
        }
    },

    /**
     * 叫分
     * @param data
     * */
    jiaofen(data) {
        if (data.uid == cc.dm.user.uid) {
            let jiaofenNode = this.node.getChildByName('jiaofenNode');
            if (jiaofenNode) {
                jiaofenNode.getComponent('poker_sdh_jiaofen').reset();
            }
        }

        this.callinfo.getComponent('poker_sdh_callinfo').checkJiaofen(data);
        this.players.forEach(el=> {
            let scr_p = this.playerScript(el);
            if (scr_p._uid == data.uid) {
                scr_p.jiaofen(data.jiaofenIdx);
            }
        });

        if (!!data.isPai) {
            this.paiNode.active = true;
            this.paiNode.getComponent(cc.Animation).play();
        }
    },

    /**
     * 广播庄家
     * @param uid
     */
    broadcastBanker(uid) {
        this.bankerUid = uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setPlayerBanker(true);
        }

        this.bottomCardsNode.getComponent('poker_sdh_bottomCards').reset();
    },

    /**
     * 显示定主面板
     * @param data
     * */
    showDingzhu() {
        this.players.forEach(el=> {
            let scr_p = this.playerScript(el);
            scr_p.jiaofen();
        });

        if (this.bankerUid != cc.dm.user.uid) {
            this.tipsNode.getComponent('game_tips').openTips('等待庄家定主', 10, -120);
        } else {
            this.tipsNode.getComponent('game_tips').openTips('请定主', 10, -120);
        }

        let bankerPlayer = this.getPlayerByUid(this.bankerUid);
        if (!!bankerPlayer) {
            let scr_p = this.playerScript(bankerPlayer);
            scr_p.setTurn();
            
            if (this.bankerUid == cc.dm.user.uid) {
                this.liangzhuNode.getComponent('poker_liangzhu').upSdhBtns(this._surrendered, (v) => {
                    cc.connect.send('dingzhu', v);
                }, ()=> {
                    cc.connect.send('surrender');
                });
    
                this.liangzhuNode.getComponent('poker_liangzhu').checkHolds(scr_p._holds);
            }
        }
    },

    /**
     * 显示是否同意投降面板
     * @param data
     * */
    showReplySurrender() {
        this.tipsNode.getComponent('game_tips').openTips('请选择是否同意庄家投降', 15, -140);
        let replySurrenderNode = this.node.getChildByName('replySurrenderNode');
        if (replySurrenderNode) {
            replySurrenderNode.getComponent('poker_sdh_replySurrender').showReplySurrender((reply)=> {
                cc.connect.send('replySurrender', reply);
            });
        } else {
            cc.utils.loadPrefabNode('poker_sdh/replySurrender', function (replySurrenderNode) {
                this.node.addChild(replySurrenderNode, 99, 'replySurrenderNode');
                replySurrenderNode.getComponent('poker_sdh_replySurrender').showReplySurrender((reply)=> {
                    cc.connect.send('replySurrender', reply);
                });
            }.bind(this));
        }
    },

    /**
     * 是否同意投降
     * @param data
     * */
    replySurrender(data) {
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            scr_p.replySurrender(data.reply);
        }

        if (data.uid == cc.dm.user.uid) {
            let replySurrenderNode = this.node.getChildByName('replySurrenderNode');
            if (replySurrenderNode) {
                replySurrenderNode.getComponent('poker_sdh_replySurrender').reset();
            }

            this.tipsNode.getComponent('game_tips').openTips('等待玩家选择是否同意庄家投降', undefined, -140);
        }
    },

    /**
     * 投降
     * @param data
     * */
    surrender(data) {
        //投降动画
        this.wanjiatoux.active = true;
        this.wanjiatoux.getComponent(cc.Animation).play();
        let player = this.getPlayerByUid(this.bankerUid);
        if (!!player) {
            let num = Math.floor(Math.random()*2)+1;
            cc.vv.audioMgr.playSFX("poker/sdh/"+ this.playerScript(player)._sex+"/renshu" + num + ".mp3");
        }
    },

    /**
     * 定主
     * @param data
     * */
    dingzhu(data) {
        let zhuType = data.zhuType;
        this._algorithm.zhuType = zhuType;
        if([0,1,2,3].includes(zhuType)) {
            this.playerScript(this.players[0]).checkHolds();
        }

        let p = this.getPlayerByUid(this.bankerUid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setZhuTypeSound(zhuType);     //定主音效
            let scr_p = this.playerScript(p);
            let startpos = scr_p.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
            startpos = cc.p(startpos.tx, startpos.ty);
            this.callinfo.getComponent('poker_sdh_callinfo').checkZhuType(zhuType, startpos);
        }

        this.liangzhuNode.getComponent('poker_liangzhu').reset();
    },

    /**
     * 拿底牌
     * @param cards
     * */
    addBottmCards(cards) {
        this._diLen = Array.isArray(cards) ? cards.length : cards;
        let p = this.getPlayerByUid(this.bankerUid);
        if (!p) {
            return;
        }

        let scr_p = this.playerScript(p);
        scr_p.addBottmCards(cards, (res)=> {
            this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showGetBottomCards(this._diLen, res);
        });
    },

    showMaidi() {
        if (this.bankerUid != cc.dm.user.uid) {
            this.tipsNode.getComponent('game_tips').openTips('等待庄家埋底', 45, -120);
        } else {
            this.tipsNode.getComponent('game_tips').reset();
        }

        let bankerPlayer = this.getPlayerByUid(this.bankerUid);
        if (!!bankerPlayer) {
            if (this.bankerUid == cc.dm.user.uid) {
                let scr_p = this.playerScript(bankerPlayer);
                let maidiNode = this.node.getChildByName('maidiNode');
                if (maidiNode) {
                    maidiNode.getComponent('poker_maidi').openMaidiNode(scr_p._holds, this._algorithm, this._diLen, this._surrendered, (cards)=> {
                        cc.connect.send('maidi', cards);
                    }, ()=> {
    
                    });
                } else {
                    cc.utils.loadPrefabNode('poker/poker_maidi', function (maidiNode) {
                        this.node.addChild(maidiNode, 1, 'maidiNode');
                        maidiNode.getComponent('poker_maidi').openMaidiNode(scr_p._holds, this._algorithm, this._diLen, this._surrendered, (cards)=> {
                            cc.connect.send('maidi', cards);
                        }, ()=> {
                    });
                    }.bind(this));
                }
            }
        }
    },

    /**
     * 埋底
     * @param data
     * */
    maidi(data) {
        cc.vv.audioMgr.playSFX("public/shuaipai.wav");
        let maidiNode = this.node.getChildByName('maidiNode');
        if (!!maidiNode) {
            maidiNode.getComponent('poker_maidi').reset();
        }
        
        let p = this.getPlayerByUid(this.bankerUid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let res = scr_p.removeBottomCards(data);
            this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showMaidiBottomCards(this._diLen, res);
        }
    },

    /**
     * 留守
     * @param data
     * */
    liushou(data) {
        if(!!data) {
            let p = this.getPlayerByUid(data.uid);
            if (!!p) {
                //显示玩家留守
                this.playerScript(p).liushou(data.type);
            }

            if(data.uid == cc.dm.user.uid) {
                this.liangzhuNode.getComponent('poker_liangzhu').reset();
            }
        }
    },

    /**
     * 报副
     * @param data
     * */
    baofu(data) {
        if(!!data) {
            let p = this.getPlayerByUid(data);
            if (!!p) {
                //显示玩家报副
                this.playerScript(p).baofu(true);
            }
        }
    },

    /**
     * 闲家得分
     * @param data
     * */
    xianScore(data, isLiangdi) {
        if (!!data && !!data.score) {
            let xianScore = data.score;
            let scoreCards = data.scoreCards;
            let ends = this.getScoreNode.getComponent('poker_getScore').addData(xianScore, scoreCards);
            let starts = [];
            if (isLiangdi) {
                starts = this.bottomCardsNode.getComponent('poker_sdh_bottomCards').getLiangdiScoreCardsPosition(this._algorithm);
            } else {
                this.players.forEach(el=> {
                    starts = starts.concat(this.playerScript(el).getOutScoreCardsPos());
                });
            }
            
            this.aniNode.getComponent('poker_ani').getScore(starts, ends);
            this.resetTableScoreNode();
            this.tableScoreNode.getComponent(cc.Label).string = '+'+xianScore+'A';
            this.tableScoreNode.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.moveBy(0.5,cc.p(0,50)), 
                cc.fadeTo(0.3, 0)));
            cc.vv.audioMgr.playSFX("poker/public/getScore.mp3");
            if (!!data.isPo) {
                this.poNode.active = true;
                this.poNode.getComponent(cc.Animation).play();
                cc.vv.audioMgr.playSFX("animate/baoza.wav");
                if (data.isXiaoPo) {
                    setTimeout(() => {
                        this.zaipoNode.active = true;
                        this.zaipoNode.getComponent(cc.Animation).play();
                        cc.vv.audioMgr.playSFX("animate/baoza.wav");
                        if (data.isDaPo) {
                            setTimeout(() => {
                                this.zaipoNode.getComponent(cc.Animation).play();
                                cc.vv.audioMgr.playSFX("animate/baoza.wav");
                            }, 1000);
                        }
                    }, 1000);
                }
            } else if (data.isXiaoPo) {
                this.zaipoNode.active = true;
                this.zaipoNode.getComponent(cc.Animation).play();
                cc.vv.audioMgr.playSFX("animate/baoza.wav");
                if (data.isDaPo) {
                    setTimeout(() => {
                        this.zaipoNode.getComponent(cc.Animation).play();
                        cc.vv.audioMgr.playSFX("animate/baoza.wav");
                    }, 1000);
                }
            } else if (data.isDaPo) {
                this.zaipoNode.active = true;
                this.zaipoNode.getComponent(cc.Animation).play();
                cc.vv.audioMgr.playSFX("animate/baoza.wav");
            }
        } else {
            this.tableScoreNode.runAction(cc.fadeTo(0.3, 0));
        }
    },

    /**
     *显示玩家留守
     */
    showLiushou(turnUid) {
        if (turnUid != cc.dm.user.uid) {
            this.tipsNode.getComponent('game_tips').openTips('等待玩家选择留守', 15, -176);
            return;
        }

        this.tipsNode.getComponent('game_tips').openTips('请选择留守', 15, -176);
        let p = this.getPlayerByUid(cc.dm.user.uid);
        if (!!p) {
            this.liangzhuNode.getComponent('poker_liangzhu').upSdhLiushouBtns(this._algorithm.zhuType, (type)=> {
                cc.connect.send('liushou', type);
            });
            let scr_p = this.playerScript(p);
            this.liangzhuNode.getComponent('poker_liangzhu').checkHolds(scr_p._holds);
        }
    },

    /**
     *切牌
     * @param event
     */
    onQieSprPressed(event, data) {
        let value = parseInt(data);
        if (this._playerquid == cc.dm.user.uid) {
            cc.connect.send("cutCard", value);
            this.qieLabelNode.active = false;
        }
    },

    //查牌
    onBtnCheckLastPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        let lastNode = this.node.getChildByName('lastNode');
        if (!!lastNode) {
            lastNode.getComponent('lastDiscards').openLastDiscards(this._lastDiscards, this._algorithm);
        } else {
            cc.utils.loadPrefabNode('poker/lastDiscards', function (lastNode) {
                this.node.addChild(lastNode, 1, 'lastNode');
                lastNode.getComponent('lastDiscards').openLastDiscards(this._lastDiscards, this._algorithm);
            }.bind(this));
        }
    },
    
    /**
        * 出牌按钮点击
        */
    onChupaiBtnPressed() {
        cc.vv.audioMgr.playButtonSound()
        if (this.playerScript(this.players[0]).chupai()) {

        }else {
            this.buheliNode.active = true;
            this.scheduleOnce(function () {
                this.buheliNode.active = false;
            }, 1.5);
        }
    },

    onChatBtnPressed() {
        this.holdArrays({holds: [45, 32, 6, 51, 49, 49, 26, 37, 37, 36, 36, 35, 34, 13, 24, 23, 22, 22, 10], diLen: 8});
        // this.broadcastBanker(203542);
        // this.addBottmCards(9);
        // this.dingzhu({zhuType:1});
        // this.maidi([53, 53, 32, 45, 19, 19, 14, 1, 37]);
        // this.xianScore({score: 20, scoreCards: [12,12], isPo: true, isXiaoPo: true, isDaPo: true});
        // this.liangdi({bottomCards: [5,6,7,8,12,12,18,19,20], isKoudi: true, score: 20, scoreCards: [12,12], isPo: true, isXiaoPo: true, isDaPo: true});
        // this.gameResult({"allScore":{"203542":10000,"725859":-20000,"934220":10000},"xianScore":90,"zhuType":3, "banker":725859,"settleType":4});
    }
});

