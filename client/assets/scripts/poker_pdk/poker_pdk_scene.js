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
        this.tishiBtn = single.getChildByName('btnTishi');
        this.chupaiBtn = single.getChildByName('btnChupai');
        this.qieNode = single.getChildByName('qieNode');
        this.buheliNode = single.getChildByName('buheli');
        this.leftCardsNode = single.getChildByName('poker_pdk_leftCards');
        this.heitao3Node = single.getChildByName('heitao3');

        this.fapaiNode = single.getChildByName('fapaiNode');
        
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

    sceneNodesReset() {
        this.qieNode.getComponent('QieNode').closeQieNode();

        this.tishiBtn.active = false;
        this.chupaiBtn.active = false;
        this.leftCardsNode.getComponent('poker_pdk_leftCards').reset();
        this.heitao3Node.getComponent(cc.Animation).stop();
        this.heitao3Node.active = false;
        this.fapaiNode.getComponent('FapaiNode').reset();

        this._algorithm.lastCards = undefined;
    },

    // update (dt) {},

    /**
     * 游戏开始
     * @param data
     */
    gameBegin(data) {
        this._super(data);

        cc.vv.audioMgr.playSFX("poker/public/kaiju.mp3");
        this.sceneNodesReset();

        this._algorithm.heitao3fisrt = false;
    },

    /**
     * 切牌开始
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
        this.qieNode.getComponent('QieNode').qieValue(data.index);
    },

    /**
     * 游戏信息
     * @param data
     */
    gameInfo(data) {
        this._super(data);
        let banker = data.banker;
        if (banker > 0) {
            this.broadcastBanker(banker);
        }

        this._algorithm.heitao3fisrt = !!data.heitao3;
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
     * 庄家
     * @param {*} uid 
     */
    broadcastBanker(uid) {
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            this.playerScript(p).setPlayerBanker(true);
        }
    },

    heitao3(uid) {
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let outsNode = p.getChildByName('outsNode');
            let pos = outsNode.getNodeToWorldTransformAR();
            pos = cc.p(pos.tx, pos.ty);
            pos = this.node.convertToNodeSpaceAR(pos);
            this.heitao3Node.active = true;
            this.heitao3Node.setPosition(pos);
            this.heitao3Node.getComponent(cc.Animation).play('heitao3');
        }

        this._algorithm.heitao3fisrt = true;
    },
    
    /***
     *  抓牌
     * @param data
     */
    holdArrays(data) {
        let c = data.c;
        let holds = data.holds;
        this.stopQie();
        this.players.forEach((el, idx)=> {
            if (idx == 0) {
                this.playerScript(el).resetHolds(holds, c);
                if (c == 1) {
                    setTimeout(() => {
                        let ends = this.playerScript(el).getHoldsPositons();
                        if (Array.isArray(ends) && ends.length > 0) {
                            this.fapaiNode.getComponent('FapaiNode').showFapai1(ends, 0.72);
                        }
                    }, 100);
                }
                if (c == 2) {
                    this.fapaiNode.getComponent('FapaiNode').reset();
                }
            } else {
                if (c == 1) {
                    let end = this.playerScript(el).showCardNum();
                    setTimeout(() => {
                        if (end) {
                            this.fapaiNode.getComponent('FapaiNode').showFapai2(holds, end, 0.24);
                        }
                    }, 100);

                    
                }
            }
        });
    },

    /***
     *  轮转
     * @param data
     */
    turn (data) {
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
                    let p = this.getPlayerByUid(data.turn);
                    if (!!p) {
                        this.playerScript(p).clearOutCards();
                    }
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

        this._algorithm.heitao3fisrt = false;
    },

    /**
     * 游戏提示
     * @param data
     */
    gameTips(data) {

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
     * 警报
     * @param data
     */
    alert(data) {
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let ps = this.playerScript(p)
            ps.setAlert(true);
            cc.vv.audioMgr.playSFX("poker/"+ps._sex+"/baojing.mp3");
        } else {
            // console.error('alert 有玩家不见了 data = ', data);
            return;
        }
    },

    showLoserCard(loserCard) {
        for (let uid in loserCard) {
            let cards = loserCard[uid];
            if (typeof uid == 'string') {
                uid = parseInt(uid);
            }
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                this.playerScript(p).showLoserCard(cards);
            }
        }
    },

    /**
     * 游戏结果
     * @param data
     */
    gameResult(data) {
        this._myReady = false;
        this.startEndnode();
        this.tishiBtn.active = false;
        this.chupaiBtn.active = false;

        let loserCard = data.loserCard;
        this.showLoserCard(loserCard);

        let leftCards = data.leftCards;
        if (Array.isArray(leftCards) && leftCards.length > 0) {
            this.leftCardsNode.getComponent('poker_pdk_leftCards').openLeftCards(leftCards);
        }

        let allScores = data.allScore;
        let winuid = 0;
        let loses = [];     //输分玩家
        /**  计算分数 */
        for (let uid in allScores) {
            let score = allScores[uid];
            if (score < 0) {
                loses.push(uid);
            } else if (score > 0) {
                winuid = uid;
            }

            let p = this.getPlayerByUid(uid);
            if (!!p) {
                this.playerScript(p).gameOver();
            }
        }

        if (winuid > 0) {
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
        }

        if(allScores[cc.dm.user.uid]) {
            if(allScores[cc.dm.user.uid] >= 0){
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
     * 炸弹分
     * @param data
     */
    bomb_score(data) {
        for (let uid in data) {
            let score = data[uid];
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.showScore(score, true);
            }
        }
    },

    /***
     *  当局牌数
     * @param data
     */
    localCardNum(data) {
        //{100150: 12, 100153: 9, 809634: 0}
        let uid = data.uid;
        let num = data.num;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            this.playerScript(p).setCardNum(num);
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
        let p = this.getNextPlayer();
        let alert = false;
        if (!!p) {
            alert = this.playerScript(p)._alert;
        }

        this.playerScript(this.players[0]).checkTishi(alert, click);
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

    // onChatBtnPressed() {
    //     this.holdArrays({holds: [25, 51, 11, 49, 36, 34, 47, 46, 7, 32, 45, 6, 18, 44, 30], c: 1});
    // }
});



