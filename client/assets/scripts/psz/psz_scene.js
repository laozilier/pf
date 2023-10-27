cc.Class({
    extends: require('../games/Game_scene'),

    properties: {
        bipaiBut: {
            default: null,
            type: cc.Node,
            displayName: "比牌按钮"
        },

        kanpaiBut: {
            default: null,
            type: cc.Node,
            displayName: "看牌按钮"
        },
        genzhuBut: {
            default: null,
            type: cc.Node,
            displayName: "跟注按钮"
        },
        gendaodiBut: {
            default: null,
            type: cc.Node,
            displayName: "跟到底按钮"
        },
        allinBut: {
            default: null,
            type: cc.Node,
            displayName: "孤注一掷按钮"
        },
        cancelBut: {
            default: null,
            type: cc.Node,
            displayName: "取消跟注按钮"
        },
        jiazhuBut: {
            default: null,
            type: cc.Node,
            displayName: "加注按钮"
        },
        qipaiBut: {
            default: null,
            type: cc.Node,
            displayName: "弃牌按钮"
        },
        betNode: {
            default: null,
            type: cc.Node,
            displayName: "下注节点"
        },
        chouma: {
            default: null,
            type: cc.Prefab,
            displayName: "筹码预制资源"
        },

        bipaiNode: {
            default: null,
            type: cc.Node,
            displayName: "比牌节点"
        },
        allinNode: {
            default: null,
            type: cc.Node,
            displayName: "孤注一掷节点"
        },
        cardTypeNode: {
            default: null,
            type: cc.Node,
            displayName: "牌类型动画节点"
        },
        maSprite: {
            default: [],
            type: cc.SpriteFrame,
            displayName: "筹码精灵"
        },
        lunNumNode: {
            default: null,
            type: cc.Node,
            displayName: "轮数注数节点"
        },
        lunNumLabel: {
            default: null,
            type: cc.Label,
            displayName: "轮数"
        },
        allLabel: {
            default: null,
            type: cc.Label,
            displayName: "总注数"
        },
        anzhuLabel: {
            default: null,
            type: cc.Label,
            displayName: "暗注"
        },
        mingzhuLabel: {
            default: null,
            type: cc.Label,
            displayName: "明注"
        },
        anbiLabel: {
            default: null,
            type: cc.Label,
            displayName: "暗比"
        },
        mingbiLabel: {
            default: null,
            type: cc.Label,
            displayName: "明比"
        },

        jiazhuNode: {
            default: null,
            type: cc.Node,
            displayName: "加注节点"
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();

        cc.psz_enum = require('psz_enum');
        cc.vv.audioMgr.playBGM("bg/niuniubg.mp3");

        this.initEvent();

        this.scoreTips = this.node.getChildByName('scoreTips');
        //let single = this.node.getChildByName('single');

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
    
    /**
     * 收到房间信息 父类处理完后调用
     */
    onRoomInfo(data) {
        this._super(data);

        this.betNode.removeAllChildren();
        // let playerPKNode = this.node.getChildByName('playerPKNode');
        // !!playerPKNode && (playerPKNode.getComponent('bipai').reset());
        this.scoreTips.active = false;
        this.lunNumNode.active = false;
        this.cancelBut.active = false;
        this.gendaodiBut.active = false;
        this.qipaiBut.active = false;
        this.kanpaiBut.active = false;
        this.genzhuBut.active = false;
        this.allinBut.active = false;
        this.jiazhuBut.active = false;
        this.bipaiBut.active = false;
        this.cardTypeNode.active = false;
    },

    /**
     * 游戏信息 父类处理完后调用
     * @param data
     */
    gameInfo(data) {
        this._super(data);

        /**先处理自己是否游客**/
        let istourist = data.uids.indexOf(cc.dm.user.uid) < 0;
        if (istourist) {
            this.cancelBut.active = false;
            this.gendaodiBut.active = false;
            this.qipaiBut.active = false;
            this.kanpaiBut.active = false;
            this.genzhuBut.active = false;
            this.allinBut.active = false;
            this.jiazhuBut.active = false;
            this.bipaiBut.active = false;
            this.cardTypeNode.active = false;
        }

        /**断线后显示庄家信息**/
        if (data.zuid !== null) {
            let pZhuang = this.getPlayerByUid(data.zuid);
            if (!!pZhuang) {
                let scriptZhuang = this.playerScript(pZhuang);
                scriptZhuang.setBank(true);
            }
        }
        if (data.turn != null) {
            let pTurn = this.getPlayerByUid(data.turn);
            if (!!pTurn) {
                let scriptTurn = this.playerScript(pTurn);
                scriptTurn.setTurn(data.turn);
                scriptTurn.showTurnNode(data.surplusTime);
            }
        }

        if (!istourist && data.status == 1) {
            this.cancelBut.active = false;
            this.gendaodiBut.active = false;
            this.allinBut.active = false;
            this.qipaiBut.active = true;
            this.kanpaiBut.active = true;
            this.genzhuBut.active = true;
            this.jiazhuBut.active = true;
            this.bipaiBut.active = true;

        }

        this.scoreTips.active = true;
        this.lunNumNode.active = true;
        //总奖金池
        let allLabel = this.changeNum(data.coinPool);
        this.allLabel.string = allLabel;
        //轮数
        let lunValue = !!this._model._game_rule.maxRound ? this._model._game_rule.maxRound : 7;
        this.lunNumLabel.string = "第 " + data.currRound + " / " + lunValue + " 轮";
        this.lunNumLabel.node.children[0].getComponent(cc.Label).string = "第 " + data.currRound + " / " + lunValue + " 轮";
        //下注
        this.setZhuNum(data.currFollow);
        //自己是否是庄家
        let isZhuangJia = (data.zuid === cc.dm.user.uid) ? true : false;

        //自己是否托管
        let isTrusteeship = false;
        //自己是否自动跟
        let isAuto = false;
        //自己是否可以弃牌
        let canWaiver = false;
        //自己是否已经弃牌
        let isWaiver = false;
        //自己是否可以看牌
        let canOpenCards = false;
        //自己是否已经看牌
        let isOpenedCards = false;
        //自己是否可以跟注
        let canFollow = false;
        //自己是否可以加注
        let canMulti = false;
        //自己是否可以比牌
        let canCompare = false;
        //自己是否可以孤注一掷
        let canGamble = false;
        //自己是否是比牌失败
        let isLoser = false;
        //自己总下注
        let amountFollow = 0;
        //手牌  看牌之后才有数据
        let holds = [];
        //自己的相关信息
        let userMeInfo = undefined;
        Object.keys(data.players).forEach(uid => {
            if (uid == cc.dm.user.uid) {
                userMeInfo = data.players[uid];
                if (data.turn == uid) {
                    this.compareUids = userMeInfo.compareUids;
                    this.isOpenedCards = userMeInfo.isOpenedCards;
                }

                this.currMulti = userMeInfo.currMulti;
                let p = this.getPlayerByUid(uid);
                let script = undefined;
                if (!!p) {
                    script = this.playerScript(p);
                    amountFollow = userMeInfo.amountFollow;
                    script.setSelfNum(amountFollow);
                    script.setTempScore(amountFollow);

                    if (data.zuid == uid) {
                        isZhuangJia = true;
                    }
                    if (userMeInfo.isAuto) {
                        isAuto = true;
                        this.cancelBut.active = true;
                        this.gendaodiBut.active = false;
                    } else {
                        isAuto = false;
                        if (uid == data.turn) {
                            this.cancelBut.active = false;
                            this.gendaodiBut.active = false;
                            this.genzhuBut.active = true;
                            this.genzhuBut.getComponent(cc.Button).interactable = true;
                        } else {
                            this.cancelBut.active = false;
                            this.gendaodiBut.active = true;
                        }
                    }
                    //能否弃牌
                    if (userMeInfo.canWaiver) {
                        canWaiver = true;
                        this.qipaiBut.getComponent(cc.Button).interactable = true;
                    } else {
                        canWaiver = false;
                        this.qipaiBut.getComponent(cc.Button).interactable = false;
                    }
                    //能否看牌
                    if (userMeInfo.canOpenCards) {
                        canOpenCards = true;
                        this.kanpaiBut.getComponent(cc.Button).interactable = true;
                    } else {
                        canOpenCards = false;
                        this.kanpaiBut.getComponent(cc.Button).interactable = false;
                    }
                    //是否已看牌
                    if (userMeInfo.isOpenedCards) {
                        isOpenedCards = true;
                        holds = userMeInfo.holds;
                        this.kanpaiBut.getComponent(cc.Button).interactable = false;
                        //将手牌显示出来
                        script.showCards(holds);
                        if (userMeInfo.pattern != null) {
                            script.showCardType(userMeInfo.pattern, 0, 1);
                            if (userMeInfo.pattern != 0 && userMeInfo.pattern != 1) {
                                this.cardTypeNode.active = true;
                                let shunzi = this.cardTypeNode.getChildByName('shunziNode').getComponent(sp.Skeleton);
                                let jinhua = this.cardTypeNode.getChildByName('jinhuaNode').getComponent(sp.Skeleton);
                                let jinhuashun = this.cardTypeNode.getChildByName('jinhuashunNode').getComponent(sp.Skeleton);
                                let baozi = this.cardTypeNode.getChildByName('baoziNode').getComponent(sp.Skeleton);
                                shunzi.clearTrack(0);
                                jinhua.clearTrack(0);
                                jinhuashun.clearTrack(0);
                                baozi.clearTrack(0);
                                shunzi.node.active = false;
                                jinhua.node.active = false;
                                jinhuashun.node.active = false;
                                baozi.node.active = false;
                                if (userMeInfo.pattern == 2 || userMeInfo.pattern == 6 || userMeInfo.pattern == 7 || userMeInfo.pattern == 8) {
                                    shunzi.node.active = true;
                                    shunzi.setAnimation(0, "newAnimation", false);
                                } else if (userMeInfo.pattern == 3 || userMeInfo.pattern == 5) {
                                    jinhua.node.active = true;
                                    jinhua.setAnimation(0, "newAnimation", false);
                                } else if (userMeInfo.pattern == 4 || userMeInfo.pattern == 9 || userMeInfo.pattern == 10 || userMeInfo.pattern == 11) {
                                    jinhuashun.node.active = true;
                                    jinhuashun.setAnimation(0, "newAnimation", false);
                                } else if (userMeInfo.pattern == 12) {
                                    baozi.node.active = true;
                                    baozi.setAnimation(0, "newAnimation", false);
                                } else {
                                    return;
                                }
                            }
                        }
                    } else {
                        script.showCards([]);
                    }
                    //是否已弃牌
                    if (userMeInfo.isWaiver) {
                        isWaiver = true;
                        this.qipaiBut.getComponent(cc.Button).interactable = false;
                        this.gendaodiBut.active = false;
                        this.cancelBut.active = false;
                        this.cardTypeNode.active = false;
                        script.setQipai();
                    }
                    if (userMeInfo.isLoser) {
                        isLoser = true;
                        script.setBipaiLose();
                        this.cardTypeNode.active = false;
                    }
                }
                //跟注
                if (userMeInfo.canFollow) {
                    canFollow = true;
                    this.genzhuBut.getComponent(cc.Button).interactable = true;
                } else {
                    canFollow = false;
                    this.genzhuBut.getComponent(cc.Button).interactable = false;
                }
                //加注
                if (userMeInfo.canMulti) {
                    canMulti = true;
                    this.jiazhuBut.getComponent(cc.Button).interactable = true;
                } else {
                    canMulti = false;
                    this.jiazhuBut.getComponent(cc.Button).interactable = false;
                }
                //比牌
                if (userMeInfo.canCompare) {
                    canCompare = true;
                    this.bipaiBut.getComponent(cc.Button).interactable = true;
                } else {
                    canCompare = false;
                    this.bipaiBut.getComponent(cc.Button).interactable = false;
                }
                //孤注一掷
                if (userMeInfo.canGamble) {
                    canGamble = true;
                    this.allinBut.active = true;
                    this.cancelBut.active = false;
                    this.gendaodiBut.active = false;
                } else {
                    canGamble = false;
                    this.allinBut.active = false;
                }

                //显示筹码
                let value = [];
                for (let i = 0; i < userMeInfo.listFollow.length; ++i) {
                    value[i] = this.changeValue(userMeInfo.listFollow[i]);
                    for (let j = 0; j < value[i].length; ++j) {
                        this.betAnimation({uid: uid, value: value[i][j]});
                    }
                }
            } else if (uid != cc.dm.user.uid) {
                userMeInfo = data.players[uid];
                let p = this.getPlayerByUid(uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    amountFollow = userMeInfo.amountFollow;
                    script.setSelfNum(amountFollow);
                    script.setTempScore(amountFollow);
                    script.showCards([]);
                    if (userMeInfo.isWaiver) {
                        script.setQipai();
                    }
                    if (userMeInfo.isOpenedCards) {
                        script.setKanpai();
                    }
                    if (userMeInfo.isLoser) {
                        isLoser = true;
                        script.setBipaiLose();
                    }
                }
                //显示筹码
                let value = [];
                for (let i = 0; i < userMeInfo.listFollow.length; ++i) {
                    value[i] = this.changeValue(userMeInfo.listFollow[i]);
                    for (let j = 0; j < value[i].length; ++j) {
                        this.betAnimation({uid: uid, value: value[i][j]});
                    }
                }
            }
        });

        if (data.status == 2) {
            this.cancelBut.active = false;
            this.gendaodiBut.active = false;
            this.allinBut.active = false;
        }
    },

    /**
     * 初始化监听
     */
    initEvent: function () {

    },
    /**重置游戏场景*/
    resetScene() {

    },
    /**  轮转 **/
    turn(data) {
        this._turnUid = data.uid;
        for (let i = 0; i < this._model._uids.length; ++i) {
            let uid = this._model._uids[i];
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let scr_p = this.playerScript(p);
                if (uid == this._turnUid) {
                    scr_p.setTurn(uid);
                    scr_p.showTurnNode(data.surplusTime);
                } else {
                    scr_p.stopTurn();
                }
            }
        }
        
        if (data.uid == cc.dm.user.uid) {
            let userInfo = data[cc.dm.user.uid];
            this.currMulti = userInfo.currMulti;
            this.canOpenCards = userInfo.canOpenCards;
            this.compareUids = userInfo.compareUids;
            this.isOpenedCards = userInfo.isOpenedCards;
            this.qipaiBut.getComponent(cc.Button).interactable = userInfo.canWaiver;
            this.bipaiBut.getComponent(cc.Button).interactable = userInfo.canCompare;
            this.kanpaiBut.getComponent(cc.Button).interactable = userInfo.canOpenCards;
            this.jiazhuBut.getComponent(cc.Button).interactable = userInfo.canMulti;
            this.genzhuBut.getComponent(cc.Button).interactable = userInfo.canFollow;
            this.allinBut.active = userInfo.canGamble;
            this.gendaodiBut.active = false;
            this.cancelBut.active = false;
        } else {
            this.allinBut.active = false;
            if (this._model._uids.indexOf(cc.dm.user.uid) != -1) {
                let userInfo = data[cc.dm.user.uid];
                this.qipaiBut.getComponent(cc.Button).interactable = userInfo.canWaiver;
                this.bipaiBut.getComponent(cc.Button).interactable = false;
                this.kanpaiBut.getComponent(cc.Button).interactable = userInfo.canOpenCards;
                this.jiazhuBut.getComponent(cc.Button).interactable = false;
                this.genzhuBut.getComponent(cc.Button).interactable = false;
                //需要判断是否弃牌  比牌失败
                if (!userInfo.isAuto) {
                    if (userInfo.canAuto) {
                        this.gendaodiBut.active = true;
                        this.cancelBut.active = false;
                    } else {
                        this.gendaodiBut.active = false;
                        this.cancelBut.active = false;
                    }
                } else {
                    this.gendaodiBut.active = false;
                    this.cancelBut.active = true;
                }
            }
        }
        if (this._model._uids.indexOf(cc.dm.user.uid) < 0) {
            this.gendaodiBut.active = false;
            this.cancelBut.active = false;
            this.allinBut.active = false;
        }
        //轮数
        let lunValue = !!this._model._game_rule.maxRound ? this._model._game_rule.maxRound : 7;
        this.lunNumLabel.string = "第 " + data.currRound + " / " + lunValue + " 轮";
        this.lunNumLabel.node.children[0].getComponent(cc.Label).string = "第 " + data.currRound + " / " + lunValue + " 轮";
        this.setZhuNum(data.currFollow);
    },

    /**监听游戏状态*/
    gameStatus(data) {
        this.updateGameStatus(data.status);
        if (data.status == 2) {
            this.qipaiBut.getComponent(cc.Button).interactable = false;
            this.bipaiBut.getComponent(cc.Button).interactable = false;
            this.kanpaiBut.getComponent(cc.Button).interactable = false;
            this.jiazhuBut.getComponent(cc.Button).interactable = false;
            this.genzhuBut.getComponent(cc.Button).interactable = false;
            this.gendaodiBut.active = false;
            this.cancelBut.active = false;
            this.allinBut.active = false;
        }
    },

    /**  监听操作 **/
    currentAction(data) {
        let uid = data.uid;
        let action = data.action;
        let obj = data.data;
        let p = this.getPlayerByUid(uid);
        let allLabel = this.changeNum(obj.coinPool);
        if (!!p) {
            let script = this.playerScript(p);
            let value = obj.numFollow;
            if (action == 1 || action == 2 || action == 3 || action == 5 || action == 6) {
                script.setSelfNum(obj.amountFollow);
                if (value > 0) {
                    script.setTempScore(value);
                    let changeValues = this.changeValue(value);
                    for (let i = 0; i < changeValues.length; ++i) {
                        this.betAnimation({uid: uid, value: changeValues[i]});
                    }
                }

                //总奖金池
                this.allLabel.string = allLabel;
            }
            
            switch (action) {
                case 0:
                    script.setQipai();
                    if (cc.dm.user.uid == uid) {
                        this.cardTypeNode.active = false;
                    }
                    this.compareUids = obj.compareUids;
                    if (uid == cc.dm.user.uid) {
                        this.qipaiBut.getComponent(cc.Button).interactable = false;
                        this.bipaiBut.getComponent(cc.Button).interactable = false;
                        this.kanpaiBut.getComponent(cc.Button).interactable = false;
                        this.jiazhuBut.getComponent(cc.Button).interactable = false;
                        this.genzhuBut.getComponent(cc.Button).interactable = false;
                        this.gendaodiBut.active = false;
                        this.cancelBut.active = false;
                        this.allinBut.active = false;
                    }
                    break;
                case 1:
                    let lunValue = !!this._model._game_rule.maxRound ? this._model._game_rule.maxRound : 7;
                    this.lunNumLabel.string = "第 1 / " + lunValue + " 轮";
                    this.lunNumLabel.node.children[0].getComponent(cc.Label).string = "第 1 / " + lunValue + " 轮";
                    this.setZhuNum(value);
                    break;
                case 2:
                    script.playGenzhuSound();
                    break;
                case 3:
                    script.playJiazhuSound();
                    break;
                case 4:
                    //看牌的是自己  翻牌  看牌的不是自己  找到对应的玩家显示看牌状态
                    if (uid == cc.dm.user.uid) {
                        cc.vv.audioMgr.playButtonSound();
                        if (obj.cards.length != 0) {
                            script.kanPai(obj.cards, obj.pattern);
                            if (obj.pattern != 0 && obj.pattern != 1) {
                                this.cardTypeNode.active = true;
                                let shunzi = this.cardTypeNode.getChildByName('shunziNode').getComponent(sp.Skeleton);
                                let jinhua = this.cardTypeNode.getChildByName('jinhuaNode').getComponent(sp.Skeleton);
                                let jinhuashun = this.cardTypeNode.getChildByName('jinhuashunNode').getComponent(sp.Skeleton);
                                let baozi = this.cardTypeNode.getChildByName('baoziNode').getComponent(sp.Skeleton);
                                shunzi.clearTrack(0);
                                jinhua.clearTrack(0);
                                jinhuashun.clearTrack(0);
                                baozi.clearTrack(0);
                                shunzi.node.active = false;
                                jinhua.node.active = false;
                                jinhuashun.node.active = false;
                                baozi.node.active = false;
                                if (obj.pattern == 2 || obj.pattern == 6 || obj.pattern == 7 || obj.pattern == 8) {
                                    shunzi.node.active = true;
                                    shunzi.setAnimation(0, "newAnimation", false);
                                } else if (obj.pattern == 3 || obj.pattern == 5) {
                                    jinhua.node.active = true;
                                    jinhua.setAnimation(0, "newAnimation", false);
                                } else if (obj.pattern == 4 || obj.pattern == 9 || obj.pattern == 10 || obj.pattern == 11) {
                                    jinhuashun.node.active = true;
                                    jinhuashun.setAnimation(0, "newAnimation", false);
                                } else if (obj.pattern == 12) {
                                    baozi.node.active = true;
                                    baozi.setAnimation(0, "newAnimation", false);
                                } else {
                                    return;
                                }
                            }
                        }
                        this.kanpaiBut.getComponent(cc.Button).interactable = false;
                    } else {
                        script.setKanpai(true);
                    }

                    if (this._turnUid == uid) {
                        this.isOpenedCards = true;
                    }
                    break;
                case 5:
                    //比牌
                    for (let i = 0; i < this._model._uids.length; ++i) {
                        let p = this.getPlayerByUid(this._model._uids[i]);
                        if (!!p) {
                            let scr = this.playerScript(p);
                            scr.setBipaiOk(false);
                        }
                    }
                    // this.cardTypeNode.active = false;
                    script.playBipaiSound();

                    let localSeatId = [];
                    let aa = this.getPlayerByUid(uid);
                    if (!!aa) {
                        let script = this.playerScript(aa);
                        localSeatId[0] = script.localSeat;
                    }
                    let bb = this.getPlayerByUid(obj.target);
                    if (!!bb) {
                        let script = this.playerScript(bb);
                        localSeatId[1] = script.localSeat;
                    }
                    let loserLocalSeatId = this.getPlayerByUid(obj.loser);
                    if (!!loserLocalSeatId) {
                        let script = this.playerScript(loserLocalSeatId);
                        loserLocalSeatId = script.localSeat;
                    }

                    this.showBipai(localSeatId, loserLocalSeatId);

                    this.scheduleOnce(function () {
                        let p = this.getPlayerByUid(obj.loser);
                        if (!!p) {
                            let script = this.playerScript(p);
                            script.setBipaiLose();
                        }
                        
                        if (obj.loser == cc.dm.user.uid) {
                            this.qipaiBut.getComponent(cc.Button).interactable = false;
                            this.bipaiBut.getComponent(cc.Button).interactable = false;
                            this.kanpaiBut.getComponent(cc.Button).interactable = false;
                            this.jiazhuBut.getComponent(cc.Button).interactable = false;
                            this.genzhuBut.getComponent(cc.Button).interactable = false;
                            this.gendaodiBut.active = false;
                            this.cancelBut.active = false;
                            this.allinBut.active = false;
                            this.cardTypeNode.active = false;
                        }
                    }, 2.8);
                    break;
                case 6:
                    //孤注一掷动画
                    //下注动画  **丢特别的筹码
                    //一家一家比牌
                    this.allinBut.active = false;
                    this.allinNode.active = true;
                    this.allinNode.getChildByName('allin').getComponent(cc.Animation).play('allin');
                    script.playAllinSound();
                    break;
            }

            if (this._turnUid == uid) {
                this.jiazhuNode.active = false;
            }
            if (action != 0) {
                for (let i = 0; i < this._model._uids.length; ++i) {
                    let p = this.getPlayerByUid(this._model._uids[i]);
                    if (!!p) {
                        let scripts = this.playerScript(p);
                        scripts.setBipaiOk(false);
                    }
                }
            } else {
                if (this._turnUid == uid) {
                    for (let i = 0; i < this._model._uids.length; ++i) {
                        let p = this.getPlayerByUid(this._model._uids[i]);
                        if (!!p) {
                            let scripts = this.playerScript(p);
                            scripts.setBipaiOk(false);
                        }
                    }
                }
            }
        }

        if (this._model._uids.indexOf(cc.dm.user.uid) < 0) {
            this.gendaodiBut.active = false;
            this.cancelBut.active = false;
        }
    },

    /**
     *
     * @param localSeatId
     * @param loserLocalSeatId
     */
    showBipai(localSeatId, loserLocalSeatId) {
        let playerPKNode = this.node.getChildByName('playerPKNode');
        if (!!playerPKNode) {
            let script = playerPKNode.getComponent('bipai');
            script.show(localSeatId, loserLocalSeatId);
        }
    },

    /**  自动跟注 **/
    auto(data) {
        if (data.uid == cc.dm.user.uid) {
            if (data.isAuto) {
                this.cancelBut.active = true;
                this.gendaodiBut.active = false;
            } else {
                this.cancelBut.active = false;
                this.gendaodiBut.active = true;
            }
        }
    },


    /**
     * 更新游戏状态
     */
    gameStatus (data) {
        this._super(data);
        this.players.forEach(el => {
            this.playerScript(el).setGameState(data.status);
        });
    },

    /***
     *  游戏开始
     * @param data
     */
    gameBegin(data) {
        this._super(data);

        this._isKanPai = false;
        this._liangpai = false;
        this.betNode.removeAllChildren();
        let playerPKNode = this.node.getChildByName('playerPKNode');
        !!playerPKNode && (playerPKNode.getComponent('bipai').reset());
        
        this.scoreTips.active = true;
        this.lunNumNode.active = true;
        this.cardTypeNode.active = false;

        let zuid = data.zuid;
        let p = this.getPlayerByUid(zuid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setBank(true);
        }

        if (this.isPlaying()) {
            this.cancelBut.active = false;
            this.gendaodiBut.active = false;
            this.allinBut.active = false;
            this.qipaiBut.active = true;
            this.qipaiBut.getComponent(cc.Button).interactable = false;
            this.kanpaiBut.active = true;
            this.kanpaiBut.getComponent(cc.Button).interactable = false;
            this.genzhuBut.active = true;
            this.genzhuBut.getComponent(cc.Button).interactable = false;
            this.jiazhuBut.active = true;
            this.jiazhuBut.getComponent(cc.Button).interactable = false;
            this.bipaiBut.active = true;
            this.bipaiBut.getComponent(cc.Button).interactable = false;
        }

        //播放游戏开始声音
        cc.vv.audioMgr.playSFX("public/" + (this._model._currInning === 0 ? "beginGame.mp3" : "begin.mp3"));
    },

    deal(data) {
        let number = data.num;
        this._model._uids.forEach((uid) => {
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                if (number === 3) {
                    script.deal3();
                } else if (number === 0) {
                    //看牌前不给前端发数据
                    script.deal3();
                }
            }
        });
        //发牌音效
        cc.vv.audioMgr.playSFX("public/fapai.mp3");
    },

    showHolds(data) {
        let uid = data[0];
        let holds = data[1];
        let type = data[2].type;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.updateResult(holds, type);
        }
    },

    /**
     * 游戏结果
     * @param data 结果对象，一个uid对应一个分数
     */
    gameResult: function (data) {
        this.cardTypeNode.active = false;
        this._myReady = false;
        let uids = this._model._uids;
        let amountFollow = data.amountFollow;
        if (this.isPlaying() && !this.isTourist()) {
            this.startEndnode();
        }
        for (let i = 0; i < uids.length; ++i) {
            if (data.allScores[uids[i]] > 0) {
                this.resultAnimation(uids[i]);
            }
        }
        //显示分数//显示手牌
        for (let j = 0; j < uids.length; ++j) {
            let scores = data.allScores[uids[j]];
            let holds = data.allCards[uids[j]];
            let p = this.getPlayerByUid(uids[j]);
            if (!!p) {
                let script = this.playerScript(p);
                if (scores > 0) {
                    script.showScore(scores + amountFollow);
                } else if (scores < 0) {
                    script.showScore(scores);
                }
                script.showCards(holds);
                if (!!data.types) {
                    let type = data.types[uids[j]];
                    script.showCardType(type, 0, 0);
                }
                script.setResetNodes();
                script.stopClock();
                if (scores > 0) {
                    script.playSaoGuang();
                }
            }
        }

        this.scheduleOnce(function () {
            if (!!this._autoOut && this.isPlaying()) {
                this.backHall();
            }
        }, 3);
    },

    update: function (dt) {

    },

    /**
     * 设置倍数
     */
    onSetMultiple: function (event, id) {
    },


    /**准备按钮*/
    onReady: function () {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.ready();
    },

    onJiazhu() {
        //获取底注
        let ante = this._model._game_rule.ante;
        let isOpenedCards = this.isOpenedCards;
        for (let i = 0; i < 3; ++i) {
            this.jiazhuNode.children[i].active = true;
        }
        if (this.jiazhuNode.active) {
            this.jiazhuNode.active = false;
            return;
        }
        this.jiazhuNode.active = true;
        let maNum = 0;
        for (let i = 0; i < 3; ++i) {
            if (isOpenedCards) {
                maNum = ante * (i + 1) * 2 * 2;
                let key = this.changeNum(maNum);
                this.jiazhuNode.children[i].children[0].getComponent(cc.Label).string = key;
                if (this.currMulti == 2) {
                    this.jiazhuNode.children[0].active = false;
                } else if (this.currMulti == 4) {
                    this.jiazhuNode.children[0].active = false;
                    this.jiazhuNode.children[1].active = false;
                }
            } else {
                maNum = ante * (i + 1) * 2;
                let key = this.changeNum(maNum);
                this.jiazhuNode.children[i].children[0].getComponent(cc.Label).string = key;
                if (this.currMulti == 2) {
                    this.jiazhuNode.children[0].active = false;
                } else if (this.currMulti == 4) {
                    this.jiazhuNode.children[0].active = false;
                    this.jiazhuNode.children[1].active = false;
                }
            }
            if (maNum <= 5000) {
                this.jiazhuNode.children[i].getComponent(cc.Sprite).spriteFrame = this.maSprite[1];
            } else if (maNum <= 10000) {
                this.jiazhuNode.children[i].getComponent(cc.Sprite).spriteFrame = this.maSprite[2];
            } else if (maNum <= 50000) {
                this.jiazhuNode.children[i].getComponent(cc.Sprite).spriteFrame = this.maSprite[3];
            } else if (maNum <= 100000) {
                this.jiazhuNode.children[i].getComponent(cc.Sprite).spriteFrame = this.maSprite[4];
            } else if (maNum < 200000) {
                this.jiazhuNode.children[i].getComponent(cc.Sprite).spriteFrame = this.maSprite[5];
            }
        }
    },

    changeNum(data) {
        let numString = null;
        if (data >= 10000) {
            numString = Math.floor(data / 1000) * 1000;
            numString = numString / 10000 + 'B';
        } else {
            numString = data;
        }
        return numString;
    },
    /**
     * 加注数
     */
    onJiazhuNum(event, data) {
        cc.connect.send("follow", data);
    },
    /**
     *
     */
    onBipai() {
        cc.vv.audioMgr.playButtonSound();
        if (this.compareUids.length == 1) {
            cc.connect.send("compare", this.compareUids[0]);
            return;
        }
        for (let i = 0; i < this.compareUids.length; ++i) {
            let p = this.getPlayerByUid(this.compareUids[i]);
            if (!!p) {
                let script = this.playerScript(p);
                script.setBipaiOk(true);
            }
        }
    },
    onBipaiplayer(event, data) {
        //根据localId 获取uid
        let p = this.getPlayerByLocalSeat(data);
        if (!!p) {
            let playerData = this.playerScript(p);
            let uid = playerData._uid;
            cc.connect.send("compare", uid);
        }
    },
    onQipai() {
        cc.connect.send("waiver");
        cc.vv.audioMgr.playButtonSound();
    },
    onCancel() {
        cc.connect.send("setAuto", false);
        cc.vv.audioMgr.playButtonSound();
    },
    onGenzhu() {
        cc.connect.send("follow", this.currMulti);
        cc.vv.audioMgr.playButtonSound();
    },
    onGendaodi() {
        cc.connect.send("setAuto", true);
        cc.vv.audioMgr.playButtonSound();
    },
    onKanpai() {
        cc.connect.send("openCards");
        this.jiazhuNode.active = false;
        cc.vv.audioMgr.playButtonSound();
    },
    onGamble() {
        cc.connect.send("gamble");
        cc.vv.audioMgr.playButtonSound();
    },
    resultAnimation(data) {
        let chouma = [];
        let euid = data;
        let p = this.getPlayerByUid(euid);
        if (!p) {
            return;
        }
        let epos = p.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
        epos = this.betNode.convertToNodeSpaceAR(cc.p(epos.tx, epos.ty));

        for (let i = 0; i < this.betNode.children.length; ++i) {
            chouma[i] = this.betNode.children[i];
            let spos = chouma[i].getNodeToWorldTransformAR();
            spos = this.betNode.convertToNodeSpaceAR(cc.p(spos.tx, spos.ty));
            chouma[i].x = spos.x;
            chouma[i].y = spos.y;
            chouma[i].runAction(cc.sequence(cc.moveTo(0.3, cc.p(epos.x, epos.y)), cc.fadeTo(0.05, 0), cc.removeSelf()));
        }
        cc.vv.audioMgr.playSFX("psz/chouma_winner.mp3");
    },

    betAnimation(data) {
        let chouma = cc.instantiate(this.chouma);
        chouma.getComponent("chouma").Chouma(data.value);
        chouma.parent = this.betNode;
        chouma.active = true;

        let suid = data.uid;
        let p = this.getPlayerByUid(suid);
        if (!p) {
            return;
        }
        /**  找到起点的节点(的位置转化成世界坐标)<返回的是一个对象>  **/
        let spos = p.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
        spos = this.betNode.convertToNodeSpaceAR(cc.p(spos.tx, spos.ty));
        chouma.x = spos.x;
        chouma.y = spos.y;
        /** 随机产生终点位置**/
        let epos = cc.p(667, 440);
        let r = 140;
        let x = Math.random() * r * 2 - r;
        let maxy = Math.sqrt(Math.pow(r, 2) - Math.pow(x, 2));
        let y = Math.random() * maxy - maxy / 2;

        epos.x += x;
        epos.y += y;
        chouma.runAction(cc.moveTo(0.3, epos));

        cc.vv.audioMgr.playSFX("public/bet.mp3");
    },

    changeValue(data) {
        let num = [];
        num[0] = data;
        if (data > 10000) {
            let key1 = Math.floor(data / 10000) * 10000;
            let key2 = Math.floor((data % 10000) / 1000) * 1000;
            let key3 = data % 1000;
            num[0] = key1;
            if (key2 != 0) {
                num[1] = key2;
            }
            if (key3 != 0) {
                num[2] = key3;
            }
        }
        return num;
    },

    xi(data) {
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let script = this.playerScript(p);
            //显示牌
            script.showCards(data.cards);
            script.setResetNodes();
            script.showCardType(data.pattern, 1, 0);
            this.cardTypeNode.active = false;
            //显示分数
            for (let i = 0; i < this._model._uids.length; ++i) {
                let uid = this._model._uids[i];
                let xiScore = data.xiScoreMap[uid];
                let p = this.getPlayerByUid(uid);
                if (!!xiScore && !!p) {
                    let script = this.playerScript(p);
                    //显示喜分
                    this.scheduleOnce(function () {
                        script.showScore(xiScore, true);
                        if (xiScore > 0) {
                            script.playSaoGuang();
                        }
                    }, 0.5);
                }
            }
        }
    },

    //玩家已弃牌
    compare(data) {
        return;
    },

    setZhuNum(data) {
        let anzhu = data;
        anzhu = this.changeNum(anzhu);
        this.anzhuLabel.string = anzhu;

        let mingzhu = data * 2;
        mingzhu = this.changeNum(mingzhu);
        this.mingzhuLabel.string = mingzhu;

        let anbi = data * 2;
        anbi = this.changeNum(anbi);
        this.anbiLabel.string = anbi;

        let mingbi = data * 4;
        mingbi = this.changeNum(mingbi);
        this.mingbiLabel.string = mingbi;

    },


});
