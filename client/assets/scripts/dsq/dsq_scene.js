// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

let chess = require('dsq_enum');
cc.Class({
    extends: require('../games/Game_scene'),

    properties: {
        buttonNode: {
            default: null,
            type: cc.Node
        },
        renshuNode: {
            default: null,
            type: cc.Node
        },
        VS: {
            default: null,
            type: cc.Node
        },

        cardNode: {
            default: null,
            type: cc.Node
        },
        round_redNode: {
            default: null,
            type: cc.Node
        },
        round_blueNode: {
            default: null,
            type: cc.Node
        },
        spriteArr: {
            default: [],
            type: [cc.SpriteFrame]
        },
        invitation_btn: {
            default: null,
            type: cc.Node
        },

        anteLab: {
            default: null,
            type: cc.Label
        },

        curRidLab: {
            default: null,
            type: cc.Label
        },

        qrNode1:{
            default:null,
            type:cc.Node,
            displayName:"二维码图片"
        },

    },
    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();
        // this.refrshChess();
        this.buttonNode.active = false;
        this.renshuNode.active = false;
        this.VS.active = false;
        this.isOk = false;
        this.paiArr = [];
        this.isTurn = -1;
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

    // update (dt) {},
    /**
     * 收到房间信息 父类处理完后调用
     */
    onRoomInfo() {
        this._super();

        this.VS.active = false;
        // this.anteLabel.node.active = false;
        this.invitation_btn.active = true;
        this.curRidLab.string = this._model._rid;

        this.anteLab.node.active = true;
        let antestr = cc.utils.getScoreStr(this._model._game_rule.ante);
        this.anteLab.string = antestr;
        this.anteLab.node.getChildByName('Lab1').getComponent(cc.Label).string = antestr;
        this.anteLab.node.getChildByName('Lab2').getComponent(cc.Label).string = antestr;

        this.refrshChess();
    },

    /**
     * 游戏开始
     * @param data
     */
    gameBegin(data) {
        this._super(data);

        cc.vv.audioMgr.playSFX("public/audio_ready.mp3");
        this.refrshChess();
        this.invitation_btn.active = false;
        //1.显示认输
        if (!this.isTourist()) {
            this.renshuNode.active = true;
        }
        //显示VS图片
        this.VSrunAction(this.VS);
        chess.intiChess();
        chess.isSelect = false;
        this.buttonNode.active = true;

        for (let i = 0; i < data.uids.length; i++) {
            let uid = data.uids[i];
            let p = this.getPlayerByUid(uid);
            if (data.types[uid] == 1 && uid == cc.dm.user.uid) {
                this.playType = 2;
            } else if (data.types[uid] == 0 && uid == cc.dm.user.uid) {
                this.playType = 1;
            }
        }
        //初始化棋牌和棋子
        this.initChess();
        this.stopWating();
        this.hideEndnode();
        this.setChessAction();
    },
    /**
     * 断线重连
     * @param data
     */
    gameInfo(data) {
        this._super(data);

        this.refrshChess();//刷新所有狀態
        if (!this.isTourist()) {
            this.renshuNode.active = true;
        }
        this.invitation_btn.active = false;
        this.VS.active = false;
        chess.isSelect = false;
        this.buttonNode.active = true;
        chess.chess = data.chess;
        if (data.turn == cc.dm.user.uid) {
            this.isTurn = 1;
            this.isOk = true;//--------------
        } else {
            this.isTurn = 2;
        }
        for (let i = 0; i < data.uids.length; i++) {
            let uid = data.uids[i];
            let p = this.getPlayerByUid(uid);
            if (data.types[uid] == 1 && uid == cc.dm.user.uid) {
                this.playType = 2;
            } else if (data.types[uid] == 0 && uid == cc.dm.user.uid) {
                this.playType = 1;
            }
            if (!!p) {
                let ps = this.playerScript(p);
                ps.set_dsqTurn(data.turn, data.auto);
            }
        }
        this.initChess();
        this.setChessAction();
    },

    //VS动画
    VSrunAction(node) {
        node.active = true;
        node.opacity = 0;
        node.scale = 10;
        let spawn = cc.spawn(cc.fadeTo(0.8, 255), cc.scaleTo(0.8, 2));
        node.runAction(cc.sequence(spawn, cc.delayTime(0.5), cc.fadeTo(0.3, 0)));
    },

    /**
     * 轮转
     * @param data
     */
    turnOver(data) {
        this.isOk = true;//--------------
        if (this.isTourist()) {
            let p = this.getPlayerByUid(data.uid);
            if (!!p) {
                if (this.playerScript(p)._seatId == 0) {
                    //红方
                    this.round_redNode.active = true;
                    this.round_redNode.getChildByName('Label').getComponent(cc.Label).string = '红方回合';
                    this.fadeAnimation(this.round_redNode);
                } else {
                    this.round_blueNode.active = true;
                    this.round_blueNode.getChildByName('Label').getComponent(cc.Label).string = '蓝方回合';
                    this.fadeAnimation(this.round_blueNode);
                }
            }
            return;
        }
        this.players.forEach(function (p) {
            if (this.playerScript(p)._seatId > -1) {
                this.playerScript(p).set_dsqTurn(data.uid, data.auto);
            }
        }.bind(this));
        if (data.uid == cc.dm.user.uid) {
            console.log('轮到自己操作');
            //此时为自己的操作方位,显示轮到自己操作。
            this.isTurn = 1;
            if (this.playType == 1) {
                //红方操作
                this.round_redNode.active = true;
                this.round_redNode.getChildByName('Label').getComponent(cc.Label).string = '你的回合';
                this.fadeAnimation(this.round_redNode);
            } else if (this.playType == 2) {
                this.round_blueNode.active = true;
                this.round_blueNode.getChildByName('Label').getComponent(cc.Label).string = '你的回合';
                this.fadeAnimation(this.round_blueNode);
            }
            this.paiArr.forEach(value => {
                let newScript = value.getComponent('dsq_poker');
                if (newScript.getValue() != -1) {
                    newScript.isGuangSetVisbe(false);
                } else {
                    newScript.isGuangSetVisbe(true);
                }
            })
        } else {
            //显示轮到别人操作
            if (this.playType == 1) {
                //红方操作
                this.round_blueNode.active = true;
                this.round_blueNode.getChildByName('Label').getComponent(cc.Label).string = '对方回合';
                this.fadeAnimation(this.round_blueNode);
            } else if (this.playType == 2) {
                this.round_redNode.active = true;
                this.round_redNode.getChildByName('Label').getComponent(cc.Label).string = '对方回合';
                this.fadeAnimation(this.round_redNode);
            }
            this.isTurn = 2;
            this.paiArr.forEach(value => {
                let newScript = value.getComponent('dsq_poker');
                newScript.isGuangSetVisbe(false);
            })
        }
    },
    //渐隐动画
    fadeAnimation(_node) {
        _node.stopAllActions();
        _node.opacity = 255;
        let seq = cc.sequence(
            cc.delayTime(0.5),
            cc.fadeTo(0.3, 0),
            cc.callFunc(function () {
                _node.active = false;
            })
        );
        _node.runAction(seq);
    },
    /**
     * 翻牌成功
     * @param data
     */
    fanpai(data) {
        this.isOk = false;//--------------
        this.fanpaiID = data.id;
        chess.chess = data.curChess;
        let self = this;
        this.paiArr.forEach(v => {
            v.getComponent('dsq_poker').setLastHandHied(false);
        })
        this.paiArr[data.index].getComponent('dsq_poker').jitterAnimation({
            value: data.id,
            cb: (res) => {
                self.paiArr[data.index].getComponent('dsq_poker').show(data.id, true);
                if (res == self.fanpaiID) {
                    self.paiArr[data.index].getComponent('dsq_poker').setLastHandHied(true);
                }
            }
        });

        cc.vv.audioMgr.playSFX("public/fapai.mp3");
    },
    /**
     *
     * @param from []
     * @param to []
     */
    moveMyself(from, to) {
        let data = {};
        data.from = from;
        data.to = to;
        cc.connect.send("move", data);
    },
    /**
     * 移动
     */
    movesuc(data) {
        let self = this;
        this.moverID = data.toIndex;
        chess.chess = data.curChess;
        this.paiArr.forEach(v => {
            let newScript = v.getComponent('dsq_poker');
            newScript.setLastHandHied(false);
            if (newScript.getSeat() == data.fromIndex) {
                newScript.moveCardaction({
                    index: data.toIndex,
                    cb: (res) => {
                        if (data.res == 0) {
                            self.switchingTexture(data.toIndex);
                            this.paiArr.forEach(value => {
                                let seat = value.getComponent('dsq_poker').getSeat();
                                if (seat == data.fromIndex || seat == data.toIndex) {
                                    value.getComponent('dsq_poker').setSeat(-100);
                                    value.active = false;
                                }
                            });

                            cc.vv.audioMgr.playSFX("animate/baoza.wav");
                        } else if (data.res == 1 || data.res == 2) {
                            if (data.res == 1) {
                                //能吃
                                self.switchingTexture(data.toIndex);
                                cc.vv.audioMgr.playSFX("psz/shandian.mp3");
                            } else {
                                cc.vv.audioMgr.playSFX("public/fapai.mp3");
                            }
                            this.paiArr.forEach(value => {
                                let seat = value.getComponent('dsq_poker').getSeat();
                                if (seat == data.fromIndex) {
                                    if (self.moverID == res) {
                                        // value.getComponent('dsq_poker').setLastHandHied(true);
                                    }
                                    value.getComponent('dsq_poker').setSeat(data.toIndex);
                                }
                                if (seat == data.toIndex) {
                                    value.getComponent('dsq_poker').setSeat(-100);
                                    value.active = false;
                                }
                            });

                        } else if (data.res == -1) {
                            self.switchingTexture(data.toIndex);
                            //自己死掉
                            this.paiArr.forEach(value => {
                                let seat = value.getComponent('dsq_poker').getSeat();
                                if (seat == data.fromIndex) {
                                    value.getComponent('dsq_poker').setSeat(-100);
                                    value.active = false;
                                }
                            });

                            cc.vv.audioMgr.playSFX("public/endLose.mp3");
                        }
                    }
                })
            }
        })
    },

    switchingTexture(spt) {
        let node = new cc.Node('Sprite');
        let sp = node.addComponent(cc.Sprite);
        sp.spriteFrame = this.spriteArr[0];
        node.position = chess.positionsArr[spt];
        this.nodeIndex = 0;
        node.parent = this.node;
        let self = this;
        let f = function () {
            if (self.nodeIndex >= 6) {
                this.nodeIndex = 0;
                node.destroy();
                this.unschedule(f);
                return;
            }
            sp.spriteFrame = this.spriteArr[self.nodeIndex];
            self.nodeIndex++;
        }
        this.schedule(f, 0.02);
    },

    zhuiqi(data) {
        if (data.v == 0) {
            cc.utils.openWeakTips('追棋判定开始，12回合内游戏将结束！');
        } else {
            cc.utils.openWeakTips('追棋回合过多，游戏结束！');
        }
    },

    /**
     * 游戏结果
     */
    gameResult(data) {
        this.isOk = false;//--------------
        this.VS.active = false;
        this.invitation_btn.active = true;
        this.renshuNode.active = false;
        if (this.buttonNode.active) {
            this.buttonNode.active = false;
        }

        this._myReady = false;
        this.startEndnode(30);
        this._model._running = false;
        this.players.forEach((p) => {
            this.playerScript(p).stopClock();
        });
        /** 金币动画 **/
        let winuid = undefined;
        let loseuid = undefined;
        let score = 0;
        for (let uid in data) {
            let s = data[uid];
            if (s > 0) {
                winuid = uid;
                score = s;
            } else if (s < 0) {
                loseuid = uid;
            }

            let p = this.getPlayerByUid(uid);
            if (!!p) {
                this.playerScript(p).stopClock();
            }
        }
        if (!!loseuid && !!winuid && score > 0) {
            let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
            let loseplayer = this.getPlayerByUid(loseuid);
            let winplayer = this.getPlayerByUid(winuid);
            if (!!loseplayer && !!winplayer) {
                let losescr = this.playerScript(loseplayer);
                losescr.showScore(-1*score);
                let cb = (() => {
                    let winscr = this.playerScript(winplayer);
                    winscr.showScore(score);
                    winscr.playSaoGuang();
                });

                let spos = loseplayer.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
                let epos = winplayer.getChildByName('user').getChildByName('headNode').getNodeToWorldTransformAR();
                goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), this._isBackGround, cb);  
            }

            if (loseuid == cc.dm.user.uid) {
                cc.vv.audioMgr.playSFX("public/endLose.mp3");
            } else {
                cc.vv.audioMgr.playSFX("public/endWin.mp3");
            }
        } else {
            cc.vv.audioMgr.playSFX("public/endWin.mp3");
        }

        this.scheduleOnce(function () {
            if (!!this._autoOut && this.isPlaying()) {
                this.backHall();
            }
        }, 3);
    },

    /** 认输按钮响应事件 **/
    reshuButtonAction() {
        cc.utils.openTips('确定认输？\n你将会输掉本局比赛并向对方支付相应金币！！', function () {
            cc.connect.send("lose");
        }, function () {

        });
    },

    /** 结束对局按钮响应事件 **/
    overButtonAction() {
        cc.utils.openTips('确定结束对局？\n本局将会以平局结束，双方不会损失任何金币！！', function () {
            cc.connect.send("over");
        }, function () {

        });
    },

    //初始化棋盘获取棋子id
    initChess() {
        chess.isSelect = false;
        chess.from = [];
        chess.to = [];
        this.paiIDArr = [];//牌ID的数组
        for (let i = 0; i < chess.chess.length; i++) {
            for (let j = 0; j < chess.chess[i].length; j++) {
                let paiID = chess.chess[i][j];
                this.paiIDArr.push(paiID);
            }
        }
    },
    setChessAction() {
        let self = this;
        cc.loader.loadRes("prefabs/dsq/dsq_poker", function (err, prefab) {
            self.paiIDArr.forEach((v, i) => {
                let newNode = cc.instantiate(prefab)
                newNode.getComponent('dsq_poker').show(v);
                newNode.getComponent('dsq_poker').setSeat(i);
                if (self.isTurn == 1) {
                    if (v != -1) {
                        newNode.getComponent('dsq_poker').isGuangSetVisbe(false);
                    }
                } else {
                    newNode.getComponent('dsq_poker').isGuangSetVisbe(false);
                }
                newNode.position = chess.positionsArr[i];
                self.paiArr.push(newNode);
                self.cardNode.addChild(newNode);
            })
        });
    },
    //重置所有状态
    refrshChess() {
        let self = this;
        if (this.paiArr.length != 0) {
            this.paiArr.forEach((v, i) => {
                let cardNode = self.paiArr[i];
                cardNode.destroy();
            })
            this.paiArr = [];
        }
        chess.isSelect = false;
        chess.from = [];
        chess.to = [];
        this.isTurn = -1;
        this.playType = -1;
        this.buttonNode.active = false;
        this.VS.active = false;
        this.gameStrat = false;
    },

    cilckButtonAction(event, e) {
        let arrowArr = this.arrowHandlingEvents(parseInt(e));
        if (this.isTurn == 1) {
            if (this.isOk == false) {
                return;
            }
            //轮到自己操作才能点
            if (chess.isSelect) {
                //之前有选中的，此时将准备移动之前选中的牌并将选择状态至为false
                chess.to = chess.checkerboard[parseInt(e)];
                let paiID = 1000;
                let pai = null;
                this.paiArr.forEach((v, i) => {
                    let seat = v.getComponent('dsq_poker').getSeat();
                    let ID = v.getComponent('dsq_poker').getValue();
                    v.getComponent('dsq_poker').arrowArrIshaid(false);
                    if (ID != -1) {
                        v.getComponent('dsq_poker').isGuangSetVisbe(false);
                    }
                    if (seat == parseInt(e)) {
                        paiID = v.getComponent('dsq_poker').getValue();
                        pai = v;
                    }
                });
                //如果再选中id为0的牌之后直接移动
                if (paiID == 0) {
                    //移动
                    chess.isSelect = false;
                    let data = {};
                    data.from = chess.from;
                    data.to = chess.to;
                    cc.connect.send('move', data);
                    return;
                }
                //如果再选中id为-1的牌则翻牌
                if (paiID == -1) {
                    //翻牌
                    chess.isSelect = false;
                    chess.from = [];
                    chess.to = [];
                    let data = chess.checkerboard[parseInt(e)];
                    cc.connect.send("fanpai", data);
                    return;
                }
                //同时选中红方
                if (this.playType == 1 && paiID < 10) {
                    chess.from = chess.checkerboard[parseInt(e)];
                    chess.to = [];
                    pai.getComponent('dsq_poker').isGuangSetVisbe(true);
                    arrowArr.forEach((v, i) => {
                        if (0 == v || v > 10) {
                            pai.getComponent('dsq_poker').showArrow(i, 0);
                            let selfValue = pai.getComponent('dsq_poker').getValue() % 10;
                            let otherValue = v % 10;
                            if (selfValue < otherValue) {
                                if (selfValue == 1 && otherValue == 8) {
                                    //这时候调成绿色
                                } else {
                                    //这时候颜色调成红色
                                    pai.getComponent('dsq_poker').showArrow(i, 1);
                                }
                            } else if (selfValue == 8 && otherValue == 1) {
                                pai.getComponent('dsq_poker').showArrow(i, 1);
                            }
                        } else if (10 < v < 20) {
                            pai.getComponent('dsq_poker').getArrowArr()[i].node.active = false;
                        }
                    })
                    return;
                }
                //同时选中蓝方
                if (this.playType == 2 && paiID > 10 && paiID != 1000) {
                    chess.from = chess.checkerboard[parseInt(e)];
                    chess.to = [];
                    pai.getComponent('dsq_poker').isGuangSetVisbe(true);
                    arrowArr.forEach((v, i) => {
                        if (0 <= v && v < 10) {
                            pai.getComponent('dsq_poker').showArrow(i, 0);
                            let selfValue = pai.getComponent('dsq_poker').getValue() % 10;
                            let otherValue = v % 10;
                            if (selfValue < otherValue) {
                                if (selfValue == 1 && otherValue == 8) {
                                    //这时候调成绿色
                                } else {
                                    //这时候颜色调成红色
                                    pai.getComponent('dsq_poker').showArrow(i, 1);
                                }
                            } else if (selfValue == 8 && otherValue == 1) {
                                pai.getComponent('dsq_poker').showArrow(i, 1);
                            }
                        } else if (10 < v < 20) {
                            pai.getComponent('dsq_poker').getArrowArr()[i].node.active = false;
                        }
                    })
                    return;
                }
                chess.isSelect = false;
                let data = {};
                data.from = chess.from;
                data.to = chess.to;
                cc.connect.send('move', data);
            } else {
                this.paiArr.forEach((value, index) => {
                    let newScript = value.getComponent('dsq_poker');
                    let seat = newScript.getSeat();
                    let cardID = newScript.getValue();
                    if (cardID != -1) {
                        newScript.isGuangSetVisbe(false);
                    }
                    if (parseInt(e) == seat) {
                        if (cardID == -1) {
                            chess.isSelect = false;
                            chess.from = [];
                            chess.to = [];
                            let data = chess.checkerboard[seat];
                            cc.connect.send("fanpai", data);
                        } else if (cardID == 0) {
                            //没有意义
                            chess.isSelect = false;
                        } else {
                            if (this.playType == 1 && cardID < 10) {
                                chess.isSelect = true;
                                chess.from = chess.checkerboard[seat];
                                newScript.isGuangSetVisbe(true);
                                //显示箭头
                                arrowArr.forEach((v, i) => {
                                    newScript.getArrowArr()[i].node.active = false;
                                    if (0 == v || v > 10) {
                                        newScript.showArrow(i, 0);
                                        let selfValue = newScript.getValue() % 10;
                                        let otherValue = v % 10;
                                        if (selfValue < otherValue) {
                                            if (selfValue == 1 && otherValue == 8) {
                                                //这时候调成绿色
                                            } else {
                                                //这时候颜色调成红色
                                                newScript.showArrow(i, 1);
                                            }
                                        } else if (selfValue == 8 && otherValue == 1) {
                                            newScript.showArrow(i, 1);
                                        }
                                    } else if (10 < v < 20) {
                                        newScript.getArrowArr()[i].node.active = false;
                                    }
                                })
                            } else if (this.playType == 2 && cardID > 10) {
                                chess.isSelect = true;
                                chess.from = chess.checkerboard[seat];
                                newScript.isGuangSetVisbe(true);
                                //显示箭头
                                arrowArr.forEach((v, i) => {
                                    newScript.getArrowArr()[i].node.active = false;
                                    if (0 <= v && v < 10) {
                                        newScript.showArrow(i, 0);
                                        let selfValue = newScript.getValue() % 10;
                                        let otherValue = v % 10;
                                        if (selfValue < otherValue) {
                                            if (selfValue == 1 && otherValue == 8) {
                                                //这时候调成绿色
                                            } else {
                                                //这时候颜色调成红色
                                                newScript.showArrow(i, 1);
                                            }
                                        } else if (selfValue == 8 && otherValue == 1) {
                                            newScript.showArrow(i, 1);
                                        }
                                    } else if (10 < v < 20) {
                                        newScript.getArrowArr()[i].node.active = false;
                                    }
                                })
                            }
                        }
                    }
                })
            }
        } else {
            if (this.playType == 1) {
                //红方操作
                this.round_blueNode.active = true;
                this.round_blueNode.getChildByName('Label').getComponent(cc.Label).string = '对方回合';
                this.fadeAnimation(this.round_blueNode);
            } else if (this.playType == 2) {
                this.round_redNode.active = true;
                this.round_redNode.getChildByName('Label').getComponent(cc.Label).string = '对方回合';
                this.fadeAnimation(this.round_redNode);
            }
        }
    },
    //帮助按钮响应事件
    helpButtonAction() {
        this.VSrunAction(this.VS);
    },

    //邀请按钮响应事件
    invitation_btnAction() {
        if (this._wxing) {
            return;
        }
        this.setQRPic();
        this._wxing = true;
        wxApi.shareImg(null, 0);
        setTimeout(function () {
            this._wxing = false;
            this.qrNode1.parent.active = false;
        }.bind(this), 5000);
    },

    setQRPic () {
        this.qrNode1.parent.active = true;
        if (!!this._url) {
            return;
        }

        this._url = 'yfchess://yf.com?roomId='+this._model._rid;
        let qrcode = new QRCode(-1, QRErrorCorrectLevel.M);
        qrcode.addData(this._url);
        qrcode.make();

        let ctx = this.qrNode1.getComponent(cc.Graphics);
        ctx.fillColor = cc.Color.BLACK;
        // compute tileW/tileH based on node width and height
        let tileW = this.qrNode1.width / qrcode.getModuleCount();
        let tileH = this.qrNode1.height / qrcode.getModuleCount();

        // draw in the Graphics
        for (let row = 0; row < qrcode.getModuleCount(); row++) {
            for (let col = 0; col < qrcode.getModuleCount(); col++) {
                if (qrcode.isDark(row, col)) {
                    let w = (Math.ceil((col + 1) * tileW) - Math.floor(col * tileW));
                    let h = (Math.ceil((row + 1) * tileW) - Math.floor(row * tileW));
                    ctx.rect(Math.round(col * tileW), Math.round(row * tileH), w, h);
                    ctx.fill();
                }
            }
        }
    },

    //箭头处理事件
    arrowHandlingEvents(seat) {
        let cardIDarr = [];
        for (let i = 0; i < chess.chess.length; i++) {
            for (let j = 0; j < chess.chess[i].length; j++) {
                let paiID = chess.chess[i][j];
                cardIDarr.push(paiID);
            }
        }
        let arrowArr = [];
        if ((seat % 4) == 0) {
            if (!!this.paiArr[seat + 1]) {
                let value = cardIDarr[seat + 1];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
            arrowArr.push(-10000);
            if (!!this.paiArr[seat - 4]) {
                let value = cardIDarr[seat - 4];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
            if (!!this.paiArr[seat + 4]) {
                let value = cardIDarr[seat + 4];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
        } else if ((seat % 4) == 3) {
            arrowArr.push(-10000);
            if (!!this.paiArr[seat - 1]) {
                let value = cardIDarr[seat - 1];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
            if (!!this.paiArr[seat - 4]) {
                let value = cardIDarr[seat - 4];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
            if (!!this.paiArr[seat + 4]) {
                let value = cardIDarr[seat + 4];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
        } else {
            if (!!this.paiArr[seat + 1]) {
                let value = cardIDarr[seat + 1];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
            if (!!this.paiArr[seat - 1]) {
                let value = cardIDarr[seat - 1];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
            if (!!this.paiArr[seat - 4]) {
                let value = cardIDarr[seat - 4];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
            if (!!this.paiArr[seat + 4]) {
                let value = cardIDarr[seat + 4];
                arrowArr.push(value);
            } else {
                arrowArr.push(-10000);
            }
        }
        return arrowArr;
    },

    /**
     * 推荐按钮点击
     */
    onTuijianBtnPressed() {
        let tuijian = this.node.getChildByName('tuijian');
        if (tuijian) {
            tuijian.active = true;
            tuijian.getComponent('dsq_tuijian').open();
        } else {
            cc.utils.loadPrefabNode('dsq/dsq_tuijian', function (tuijian) {
                this.node.addChild(tuijian, 2, 'tuijian');
                tuijian.getComponent('dsq_tuijian').open();
            }.bind(this));
        }
    }

});
