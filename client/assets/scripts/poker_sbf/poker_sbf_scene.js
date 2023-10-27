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
        
        this.tipsNode = single.getChildByName('game_tips');//状态提示

        this.actNode = single.getChildByName('actNode');      //所有游戏进程控制按钮父节点
        this.tishiBtn = this.actNode.getChildByName('btnTishi');            //提示
        this.tishiBtn.active = false;
        this.chupaiBtn = this.actNode.getChildByName('btnChupai');          //出牌
        this.chupaiBtn.active = false;
        this.fanzhuBtn = this.actNode.getChildByName('btnfanzhu');          //反主
        this.fanzhuBtn.active = false;

        this.tableScoreNode = single.getChildByName('tableScore');
        this.tableScoreNode.getComponent(cc.Label).string = '';

        this.btnCheckLast = single.getChildByName('btnCheckLast');                                             //查看上手牌
        this.btnCheckLast.active = false;

        this.liujuNode = single.getChildByName('liuju');                                           //流局dongz
        this.liujuNode.active = false;

        this.liangzhuNode = single.getChildByName('poker_liangzhu');
        this.callinfo = single.getChildByName('poker_sbf_callinfo');
        this.scoreCards = single.getChildByName('scoreCards');
        this.aniNode = single.getChildByName('poker_ani');

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
        //隐藏反主
        let fanzhuNode = this.node.getChildByName('poker_fanzhu');
        if (fanzhuNode) {
            fanzhuNode.getComponent('poker_fanzhu').reset();
        }

        //亮主信息
        this.liangzhuNode.getComponent('poker_liangzhu').reset();
        this.callinfo.getComponent('poker_sbf_callinfo').reset();
        this.tableScoreNode.getComponent(cc.Label).string = '';
        this.scoreCards.getComponent('ScoreCards').reset();
        this.aniNode.getComponent('poker_ani').reset();
        this.tipsNode.getComponent('game_tips').reset();

        this.tishiBtn.active = false;
        this.chupaiBtn.active = false;
        this.fanzhuBtn.active = false;

        this.buheliNode.active = false;     //不符合规则
        this.liujuNode.getComponent(cc.Animation).stop();
        this.liujuNode.active = false;

        let lastNode = this.node.getChildByName('lastNode');
        if (!!lastNode) {
            lastNode.getComponent('lastDiscards').closeLastDiscards();
        }

        this._curDiscards = undefined;
        this._lastDiscards = undefined;
        this._tableScore = 0;
        this.btnCheckLast.active = false;

        this._algorithm.firstCards = undefined;
        this._algorithm.maxCards = undefined;
        this._algorithm.zhuType = undefined;
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

        let isFirstDiscard = true;
        /** 设置庄家 */
        if (data.banker != undefined) {                                                       //庄家
            this.broadcastBanker(data.banker);

            let zhuType = data.zhuType;
            if (typeof zhuType == 'number') {
                this._algorithm.zhuType = zhuType;
                this.callinfo.getComponent('poker_sbf_callinfo').checkZhuType(zhuType);
                let p = this.getPlayerByUid(cc.dm.user.uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.checkHolds();
                }
            }

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

            /** 上一轮牌 */
            if(!!data.lastDiscards) {
                this.lastDiscards(data.lastDiscards);
            }

            let allScoreCards = data.allScoreCards;
            if (!!allScoreCards && allScoreCards.length > 0) {
                this.scoreCards.getComponent('ScoreCards').checkScoreCards(allScoreCards);
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
            if (this._gameStatus == cc.game_enum.status.WAITJIAOZHU) {
                if (this.liangzhuNode.active) {
                    this.tipsNode.getComponent('game_tips').openTips('请选择亮主');
                } else {
                    this.tipsNode.getComponent('game_tips').openTips('等待其他玩家亮主');
                }
            }

            if (this._gameStatus == cc.game_enum.status.DISCARD) {
                /** 隐藏亮牌 */
                this.players.forEach(el=> {
                    this.playerScript(el).hideLiangCard();
                });
            }
        }

        if (this._gameStatus == cc.game_enum.status.LIUJU) {
            this.liangzhuNode.getComponent('poker_liangzhu').reset();

            this.liujuNode.active = true;
            this.liujuNode.getComponent(cc.Animation).play();
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
            case cc.game_enum.status.SENDHOLDS:
            case cc.game_enum.status.WAITJIAOZHU: {
                let dataPlayers = data.players;
                if (!!dataPlayers) {
                    let tempZhuUid = data.tempZhuUid;
                    if (!!tempZhuUid) {
                        this.jiaozhu({tempZhu: data.tempZhu, uid: tempZhuUid});
                    } else {
                        let me = dataPlayers[cc.dm.user.uid];
                        if (!!me) {
                            if (!!me.canJiaozhu && !!me.jiaozhu) {  //叫主
                                this.askjiaozhu(me.jiaozhu);
                            } else {
                                if (this._gameStatus == cc.game_enum.status.WAITJIAOZHU) {
                                    this.tipsNode.getComponent('game_tips').openTips('等待其他玩家亮主');
                                }
                            }
                        } else {
                            if (this._gameStatus == cc.game_enum.status.WAITJIAOZHU) {
                                this.tipsNode.getComponent('game_tips').openTips('等待玩家亮主');
                            }
                        }
                    }
                }
            }
                break;
            case cc.game_enum.status.WAITFANZHU: {
                this.players.forEach(el=> {
                    this.playerScript(el).setTurn(data.turn);
                    if (data.turn != cc.dm.user.uid) {
                        this.tipsNode.getComponent('game_tips').openTips('等待其他玩家反主');
                    }
                });

                let dataPlayers = data.players;
                if (!!dataPlayers) {
                    let tempZhuUid = data.tempZhuUid;
                    this.jiaozhu({tempZhu: data.tempZhu, uid: tempZhuUid});
                    let me = dataPlayers[cc.dm.user.uid];
                    if (!!me) {
                        if (!!me.canFanzhu && !!me.fanzhu) {  //叫主
                            this.askfanzhu(me.fanzhu);
                        } else {
                            this.tipsNode.getComponent('game_tips').openTips('等待其他玩家反主');
                        }
                    } else {
                        this.tipsNode.getComponent('game_tips').openTips('等待玩家反主');
                    }
                }
            }
                break;
            case cc.game_enum.status.DISCARD: 
                this.players.forEach(el=> {
                    this.playerScript(el).setTurn(data.turn);
                });

                /** 如果是首出 清掉所有出的牌 */
                if (data.isFirstDiscard) {
                    this._algorithm.firstCards = undefined;
                    this._algorithm.maxCards = undefined;
                    this.tableScoreNode.getComponent(cc.Label).string = '';
                    this.players.forEach(el=> {
                        this.playerScript(el).clearOutsNode();
                    });
                } else {
                    
                }

                /** 如果是自己 */
                if (cc.dm.user.uid == data.turn) {
                    this.tishiBtn.active = true;
                    this.chupaiBtn.active = true;
                    this.playerScript(this.players[0]).checktishi(true);
                }
                break;
        }
    },

    /***
     *  抓牌  单独一张  发21张
     * @param data
     */
    holdArrays(data) {
        if (Array.isArray(data)) {
            data = data[0];
        }
        this.qieNode.getComponent('QieNode').closeQieNode();
        if(typeof data == 'number') {
            let script = this.playerScript(this.players[0]);
            script.addHolds(data);
            if(this.liangzhuNode.active) {
                this.liangzhuNode.getComponent('poker_liangzhu').upCardsCount(data);
            }
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
            this._tableScore = data.tableScore;
            this.tableScoreNode.getComponent(cc.Label).string = this._tableScore+'A';
        }

        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.discard(cardsData, disconnect);
        }
    },

    /**
     * 游戏结果
     * @param data
     */
    gameResult(data) {
        this.scoreCards.getComponent('ScoreCards').reset();
        this._myReady = false;
        if (this.isPlaying()) {
            this.startEndnode(10);
        }
        let allScores = data.allScore;
        let wins = [];
        let loses = [];     //输分玩家
        /**  计算分数 */
        for (let uid in allScores) {
            let score = allScores[uid];
            if (score < 0) {
                loses.push(uid);
            } else if (score > 0) {
                wins.push(uid);
            }

            let p = this.getPlayerByUid(uid);
            if (!!p) {
                this.playerScript(p).gameOver();
            }
        }

        if (wins.length > 0) {
            wins.forEach(winuid=> {
                let winp = this.getPlayerByUid(winuid);
                if (!!winp) {
                    let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
                    let winscr = this.playerScript(winp);
                    loses.forEach((uid, i) => {
                        let p = this.getPlayerByUid(uid);
                        if (!!p) {
                            let losescr = this.playerScript(p);
                            losescr.showScore(allScores[uid]);
                            let spos = losescr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                            let epos = winscr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                            let cb = null;
                            if (i == loses.length-1) {
                                cb = (() => {
                                    winscr.showScore(allScores[winuid]);
                                    winscr.playSaoGuang();
                                });
                            }
            
                            goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), this._isBackGround, cb);  
                        }
                    });
                }
            });
        }

        if(allScores[cc.dm.user.uid]) {
            if(allScores[cc.dm.user.uid] >= 0) {
                cc.vv.audioMgr.playSFX("poker/public/win.mp3");
            }else{
                cc.vv.audioMgr.playSFX("poker/public/lose.mp3");
            }
        }else{
            console.log("没有分数！")
        }

        // if (!!this._autoOut && this.isPlaying()) {
        //     setTimeout(()=> {
        //         this.backHall();
        //     }, 2000);
        // }
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
     * * 询问叫主
     *  @param data
     * */
    askjiaozhu(data) {
        this.liangzhuNode.active = true;
        let p = this.players[0];
        let scr_p = this.playerScript(p);
        let holds = scr_p._holds;
        this.liangzhuNode.getComponent('poker_liangzhu').upSbfBtns(data, (v) => {
            cc.connect.send('jiaozhu', v);
        });
        this.liangzhuNode.getComponent('poker_liangzhu').checkHolds(holds);
        if (this._gameStatus == cc.game_enum.status.WAITJIAOZHU) {
            this.tipsNode.getComponent('game_tips').openTips('请选择亮主');
        }
    },

    /**
     * * 叫主
     *  @param data
     * */
    jiaozhu(data) {
        this.liangzhuNode.active = false;
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let tempZhu = data.tempZhu;
            this.tempZhu = tempZhu;
            scr_p.jiaozhu(tempZhu);
            let v = tempZhu[0];
            let t = (v > 51 ? -1 : Math.floor(v/13));
            this._algorithm.zhuType = t;
            this.callinfo.getComponent('poker_sbf_callinfo').checkZhuType(t);
            p = this.getPlayerByUid(cc.dm.user.uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.checkHolds();
                if (t < 0) {
                    cc.vv.audioMgr.playSFX('poker/sdh/'+script._sex+'/wuzhu1.mp3');
                } else {
                    cc.vv.audioMgr.playSFX('poker/bashi/'+script._sex+'/color_'+t+'.mp3');
                }
            }
        }

        this.canceljiaozhu();
    },

    /**
     * * 取消叫主
     *  @param data
     * */
    canceljiaozhu(data) {
        this.liangzhuNode.getComponent('poker_liangzhu').reset();
        this.tipsNode.getComponent('game_tips').openTips('等待其他玩家反主');
    },

    /**
     * 询问反主
     * @param data
     * */
    askfanzhu(data) {
        this.fanzhuData = data;
        this.fanzhuBtn.active = true;
        //显示有反主操作  刷新信息
        let fanzhuNode = this.node.getChildByName('fanzhuNode');
        if (fanzhuNode && fanzhuNode.active) {
            fanzhuNode.getComponent('poker_fanzhu').upFanzhuData(this.tempZhu, data, this._gameStatus);
        }

        this.tipsNode.getComponent('game_tips').openTips('请选择反主', 30, 90);
    },

    /**
     * 取消反主
     * @param data
     * */
    cancelfanzhu(data) {
        this.fanzhuBtn.active = false;
        let fanzhuNode = this.node.getChildByName('fanzhuNode');
        if (fanzhuNode) {
            fanzhuNode.getComponent('poker_fanzhu').closeFanzhu();
        }

        this.tipsNode.getComponent('game_tips').openTips('等待其他玩家反主');
    },

    /**
     * * 放弃反主
     *  @param data
     * */
    giveup(data) {
        this.cancelfanzhu();
    },

    /**
     * * 反主
     *  @param data
     * */
    fanzhu(data) {
        let lastp = this.getPlayerByUid(data.last);
        if (!!lastp) {
            this.playerScript(lastp).hideLiangCard();
        }

        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let tempZhu = data.tempZhu;
            this.tempZhu = tempZhu;
            scr_p.fanzhu(tempZhu);
            let v = tempZhu[0];
            let t = (v > 51 ? -1 : Math.floor(v/13));
            this._algorithm.zhuType = t;
            this.callinfo.getComponent('poker_sbf_callinfo').checkZhuType(t);
            p = this.getPlayerByUid(cc.dm.user.uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.checkHolds();

                if (t < 0) {
                    cc.vv.audioMgr.playSFX('poker/sdh/'+script._sex+'/wuzhu1.mp3');
                } else {
                    cc.vv.audioMgr.playSFX('poker/bashi/'+script._sex+'/color_'+t+'.mp3');
                }
            }
        }

        this.cancelfanzhu();
    },

    /**
     * 玩家得分
     * @param {*} data 
     */
    getScore(data) {
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        let end = undefined;
        if (!!p) {
            let score = data.score;
            let total = data.total;
            let script = this.playerScript(p);
            end = script.getScore(score, total);
            if (score > 0) {
                cc.vv.audioMgr.playSFX('poker/public/getScore.mp3');
            }
        }

        let cards = data.scoreCards;
        if (Array.isArray(cards)) {
            this.scoreCards.getComponent('ScoreCards').addScoreCards(cards);
        }

        let starts = [];
        this.players.forEach(el=> {
            starts = starts.concat(this.playerScript(el).getOutScoreCardsPos());
        });
        this.aniNode.getComponent('poker_ani').getScore(starts, end);
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
     * 广播庄家 或队友
     * @param uid
     */
    broadcastBanker(uid) {
        this.bankerUid = uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setPlayerBanker(true);
        }
    },

    //以下为 按钮操作
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
     *显示反主信息
     * @param event
     */
    oncontrolfanzhu() {
        let fanzhuNode = this.node.getChildByName('fanzhuNode');
        if (fanzhuNode) {
            fanzhuNode.getComponent('poker_fanzhu').openFanzhuNode(this.tempZhu, this.fanzhuData, this._gameStatus, (cards)=> {
                cc.connect.send('fanzhu', cards);
            }, ()=> {
                cc.connect.send('giveup');
            });
        } else {
            cc.utils.loadPrefabNode('poker/poker_fanzhu', function (fanzhuNode) {
                this.node.addChild(fanzhuNode, 1, 'fanzhuNode');
                fanzhuNode.getComponent('poker_fanzhu').openFanzhuNode(this.tempZhu, this.fanzhuData,this._gameStatus, (cards)=> {
                    cc.connect.send('fanzhu', cards);
                }, ()=>{
                    cc.connect.send('giveup');
                });
            }.bind(this));
        }
    },

    /**
    * 出牌按钮点击
    */
    onChupaiBtnPressed() {
        cc.vv.audioMgr.playButtonSound()
        if (!this.playerScript(this.players[0]).chupai()) {
            this.buheliNode.active = true;
            this.scheduleOnce(function () {
                this.buheliNode.active = false;
            }, 1.5);
        }
    },
});

