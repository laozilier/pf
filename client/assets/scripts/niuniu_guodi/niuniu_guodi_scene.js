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

    properties: {},

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();

        cc.vv.audioMgr.playBGM("bg/niuniubg.mp3");
        this._rotates = [[-120, 90, 50, -10, -60, -90], [-120, 96, 60, 45, -10, -45, -60, -96]];
        
        /** 抢庄按钮列表 **/
        this.multipleList = [];
        let single = this.node.getChildByName('single');
        this.multipleListNode = single.getChildByName('multipleList');
        for (let i = 0; i < 5; i++) {
            let child = this.multipleListNode.getChildByName('multipleBtn'+i);
            if (!!child) {
                cc.utils.addClickEvent(child, this, this._gameName+'_scene', 'onSetMultiple', i);
                this.multipleList.push(child);
            }
        }

        /** 下注按钮列表 **/
        this.betList = [];
        this.betListNode = single.getChildByName('betList');
        for (let i = 0; i < 5; i++) {
            let child = this.betListNode.getChildByName('betBtn'+i);
            if (!!child) {
                cc.utils.addClickEvent(child, this, this._gameName+'_scene', 'onSetBet', i);
                this.betList.push(child);
            }
        }

        this.szNode = single.getChildByName('szNode');
        for (let i = 0; i < 2; i++) {
            let child = this.szNode.getChildByName('szBtn'+i);
            if (!!child) {
                cc.utils.addClickEvent(child, this, this._gameName+'_scene', 'onSzBtnPressed', i);
            }
        }

        this.lzNode = single.getChildByName('lzNode');
        for (let i = 0; i < 2; i++) {
            let child = this.lzNode.getChildByName('lzBtn'+i);
            if (!!child) {
                cc.utils.addClickEvent(child, this, this._gameName+'_scene', 'onLzBtnPressed', i);
            }
        }

        /** 状态提示 **/
        this.tips = single.getChildByName('tips');
        /** 亮牌按钮 **/
        this.showHoldsBtn = single.getChildByName('showHoldsBtn');
        cc.utils.addClickEvent(this.showHoldsBtn, this, this._gameName+'_scene', 'onShowHolds', '');
        /** 搓牌按钮 **/
        this.cuopaiBtn = single.getChildByName('cuoPaiBtn');
        cc.utils.addClickEvent(this.cuopaiBtn, this, this._gameName+'_scene', 'onCuoPai', '');
        /** 翻牌按钮 **/
        this.fanpaiBtn = single.getChildByName('fanpaiBtn');
        cc.utils.addClickEvent(this.fanpaiBtn, this, this._gameName+'_scene', 'onFanPai', '');
        /** 通吃通赔 **/
        this.tcNode = single.getChildByName('tcNode');
        /** 自动亮牌按钮 **/
        this.autoShowBtn = single.getChildByName('autoShowBtn');
        cc.utils.addClickEvent(this.autoShowBtn, this, this._gameName+'_scene', 'onAutoShow', i);
        /** 赖子节点 **/
        this.laiziPoker = single.getChildByName('laiziPoker');
        this.laiziLab = single.getChildByName('laiziLab');
        /** 锅底节点 **/
        this.guodiNode = this.node.getChildByName('guodi');
        this.winNode = this.guodiNode.getChildByName('win');
        this.loseNode = this.guodiNode.getChildByName('lose');
        this.shouNode = this.node.getChildByName('shouNode');
        cc.utils.addClickEvent(this.shouNode, this, this._gameName+'_scene', 'onShouZhuangPressed', 0);
        
        this.customBetNode = single.getChildByName('customBetNode');
        this.customBetBar = this.customBetNode.getChildByName('customBetBar').getComponent(cc.ProgressBar);
        this._maxNodex = this.customBetBar.node.width;
        this.customBetBar.node.on(cc.Node.EventType.TOUCH_START, function (event) {
            this.checkBar(this.customBetBar.node, event);
        }.bind(this));

        this.customBetBar.node.on(cc.Node.EventType.TOUCH_MOVE, function (event) {
            this.checkBar(this.customBetBar.node, event);
        }.bind(this));

        this.customBetBar.node.on(cc.Node.EventType.TOUCH_END, function (event) {
            this.checkBar(this.customBetBar.node, event);
        }.bind(this));

        this.customBetBar.node.on(cc.Node.EventType.TOUCH_CANCEL, function (event) {
            this.checkBar(this.customBetBar.node, event);
        }.bind(this));

        let betBtn = this.customBetNode.getChildByName('betBtn');
        cc.utils.addClickEvent(betBtn, this, this._gameName+'_scene', 'onSetCustomBet', 0);
        this.betLabel = betBtn.getChildByName('Label');

        this.smNode = single.getChildByName('smNode');
        this.ball = this.smNode.getChildByName('ball');
        this.smfire = this.smNode.getChildByName('smfire');

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

        this.multipleList.forEach(el => el.active = false);
        this.betList.forEach(el => el.active = false);
        this.resetBetNode();
        this.fanpaiBtn.active = false;
        this.cuopaiBtn.active = false;
        this.showHoldsBtn.active = false;
        this.cleanTips();
        let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
        goldAni.clearAnimation();
        this._guodi = 0;
        this.lzNode.active = false;
        this.szNode.active = false;
        this.unscheduleAllCallbacks();
        this.winNode.active = false;
        this.loseNode.active = false;
        this.autoShowBtn.active = false;
    },

    /**
     * 游戏信息 父类处理完后调用
     * @param data
     */
    gameInfo (data) {
        this._super(data);

        cc.gameargs.laizi = data.laizi;
        if (cc.gameargs.laizi > -1) {
            this.showLaizi(false);
        }

        this.setGuodi(data.guodi);
        this.shouNode.active = false;
        this.lzNode.active = false;
        this.szNode.active = false;
        /**断线后显示庄家信息**/
        let gameStatus = data.status;
        let zuid = data.zuid;
        if (!!zuid) {
            let p = this.getPlayerByUid(zuid);
            if(!!p) {
                let script = this.playerScript(p);
                script.setBank(true);
                script.setScore(undefined, false, this._guodi);
            }
        }

        if (gameStatus == cc.game_enum.status.WAIT_ZHUANG) {
            let nextzuid = data.nextzuid;
            let zcount = data.zcount;
            if (zcount > 0) {
                this.ask_lianzhuang([nextzuid, zcount]);
            } else {
                this.ask_dangzhuang([nextzuid]);
            }
            this.setTips('等待玩家当庄中: ', Math.floor(data.surplusTime/1000));
        } else if (gameStatus == cc.game_enum.status.WAIT_ROBS_OPEN) {
            if(this.isPlaying()) {
                let me = data.players[cc.dm.user.uid];
                let rob = me.rob;
                if (rob == undefined) {
                    this.pleaseRob({max: data.multiple});
                    this.setTips('请抢庄: ', Math.floor(data.surplusTime/1000));
                } else {
                    this.setTips('等待抢庄: ', Math.floor(data.surplusTime/1000));
                }
            } else {
                this.setTips('等待抢庄: ', Math.floor(data.surplusTime/1000));
            }
        } else if (gameStatus == cc.game_enum.status.WAIT_BETS) {
            if(this.isPlaying()) {
                let me = data.players[cc.dm.user.uid];
                let bet = me.bet;
                if (bet == undefined) {
                    let bets = me.bets; 
                    let maxBet = me.maxBet;
                    this.startBet({bets: bets, uid: zuid, maxBet: maxBet});
                    this.setTips('请下注: ', Math.floor(data.surplusTime/1000));
                } else {
                    this.setTips('等待下注: ', Math.floor(data.surplusTime/1000));
                }
            } else {
                this.setTips('等待下注: ', Math.floor(data.surplusTime/1000));
            }
        } else if (gameStatus == cc.game_enum.status.CUOPAI_ONE) {
            if(this.isPlaying()) {
                let me = data.players[cc.dm.user.uid];
                let holdsValue = me.holdsValue;
                if (!!holdsValue) {
                    this._isLiang = true;
                } else {
                    this.showButton();
                    this.setCuoPaiValue(me.holds[me.holds.length-1]);
                }
            }
            this.setTips('等待搓牌中: ', Math.floor(data.surplusTime/1000));
        }

        this.autoShowBtn.active = this.isPlaying();
    },

    getLaiziPoker(data) {
        if (typeof data == 'object') {
            cc.gameargs.laizi = data.laizi;
        } else {
            cc.gameargs.laizi = data;
        }

        this.showLaizi(true);
    },

    showLaizi(need) {
        this.laiziLab.active = true;
        this.laiziPoker.active = true;
        // if (need) {
        //     this.laiziPoker.scale = 1;
        //     this.laiziPoker.x = 0;
        //     this.laiziPoker.y = 0;
        //     this.laiziPoker.getComponent('poker').show();
        //     this.laiziPoker.getComponent('poker').tran_ani(cc.gameargs.laizi, ()=> {
        //         let delayac = cc.delayTime(0.3);
        //         let moveac = cc.moveTo(0.5, cc.p(this.laiziLab.x, this.laiziLab.y-54));
        //         let scaleac = cc.scaleTo(0.5, 0.2);
        //         let spawnac = cc.spawn(moveac, scaleac);
        //         let sequenceac = cc.sequence(delayac, spawnac);
        //         this.laiziPoker.runAction(sequenceac);
        //     });
        // } else {
        //     this.laiziPoker.stopAllActions();
        //     this.laiziPoker.getComponent('poker').show(cc.gameargs.laizi);
        //     this.laiziPoker.x = this.laiziLab.x;
        //     this.laiziPoker.y = this.laiziLab.y-54;
        //     this.laiziPoker.scale = 0.2;
        // }

        this.laiziPoker.getComponent('poker').show(cc.gameargs.laizi);
    },

    /***
     *  游戏开始
     * @param data
     */
    gameBegin (data) {
        this._super(data);

        this.cleanTips();

        this._isFan = false;
        this._isLiang = false;
        this.winNode.active = false;
        this.loseNode.active = false;
        this.lzNode.active = false;
        this.szNode.active = false;
        let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
        goldAni.clearAnimation();
        this.shouNode.active = false;

        //播放游戏开始声音
        cc.vv.audioMgr.playSFX("public/" + (this._model._currInning === 0 ? "beginGame.mp3" : "begin.mp3"));

        if (this.isPlaying()) {
            this.autoShowBtn.active = true;
        }
    },

    /**
     * 询问连庄
     * @param {*} data 
     */
    ask_lianzhuang(data) {
        let uid = data.uid;
        if (uid == cc.dm.user.uid) {
            this.lzNode.active = true;
        } else {
            this.lzNode.active = false;
        }

        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.playRobAni(0);
        }

        //let c = data.zcount;
    },

    /**
     * 连庄按钮
     */
    onLzBtnPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('res_lianzhuang', data == 0 ? false : true);
    },

    /**
     * 询问连庄
     * @param {*} data 
     */
    ask_dangzhuang(data) {
        let uid = data[0];
        if (uid == cc.dm.user.uid) {
            this.szNode.active = true;
        } else {
            this.szNode.active = false;
        }

        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.playRobAni(0);
        }

        let lastuid = data[1];
        if (!!lastuid) {
            let lastp = this.getPlayerByUid(lastuid);
            if (!!lastp) {
                let lastscript = this.playerScript(lastp);
                lastscript.stopRobAni();
            }
        }
    },

    /**
     * 上庄按钮
     * @param {*} event 
     * @param {*} data 
     */
    onSzBtnPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('res_dangzhuang', data == 0 ? false : true);
    },

    start_guodi (data) {
        let uid = data.uid;
        let score = data.score;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let ps = this.playerScript(p);
            ps.setScore(undefined, true, score);
            let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
            let spos = ps.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
            let epos = this.guodiNode.getChildByName('Label').getNodeToWorldTransformAR();
            // let cb = (() => {
            //     this.setGuodi(score);
            // });
            this.setGuodi(score);
            goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), this._isBackGround);  
        }
    },

    ask_shouzhuang(data) {
        if(this._model._decl == cc.dm.user.uid) {
            this.shouNode.active = true;
        } else {
            this.shouNode.active = false;
        }
    },

    /**
     * 收庄
     */
    onShouZhuangPressed() {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.res_shouzhuang(true);
    },

    shouzhuang(data) {
        let uid = data[0];
        let score = data[1];
        this.setGuodi(0);
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let ps = this.playerScript(p);
            let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
            let epos = ps.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
            let spos = this.guodiNode.getChildByName('Label').getNodeToWorldTransformAR();
            let cb = (() => {
                ps.showScore(score);
                ps.showFinalScore(0);
                ps.playSaoGuang();
            });

            goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), this._isBackGround, cb);  
        }
        this.shouNode.active = false;
    },

    xiazhuang(data) {
        if (typeof data == 'number') {
            
        } else {
            let uid = data[0];
            let score = data[1];
            this.setGuodi(0);
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let ps = this.playerScript(p);
                if (score > 0) {
                    let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
                    let epos = ps.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                    let spos = this.guodiNode.getChildByName('Label').getNodeToWorldTransformAR();
                    let cb = (() => {
                        ps.showScore(score);
                        ps.showFinalScore(0);
                        ps.playSaoGuang();
                    });
        
                    goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), this._isBackGround, cb);  
                }
            }
        }

        this.shouNode.active = false;
    },

    holds5(data) {
        if(!!this._model._uids) {
            this._model._uids.forEach(el => {
                let p = this.getPlayerByUid(el);
                if(!!p) {
                    let script = this.playerScript(p);
                    if(el === cc.dm.user.uid) {
                        script.holdsData = data;
                        this.setCuoPaiValue(data[data.length-1]);
                    } else {
                        script.holdsData = 5;
                    }
                }
            });
        }
    },

    holds4(data) {
        if(!!this._model._uids) {
            this._model._uids.forEach(el => {
                let p = this.getPlayerByUid(el);
                if(!!p) {
                    let script = this.playerScript(p);
                    if(el === cc.dm.user.uid) {
                        script.holdsData = data;
                    } else {
                        script.holdsData = 4;
                    }
                }
            });
        }
    },

    holds1(data) {
        if(!!this._model._uids) {
            this._model._uids.forEach(el => {
                let p = this.getPlayerByUid(el);
                if(!!p) {
                    let script = this.playerScript(p);
                    if(el === cc.dm.user.uid) {
                        script.holdsData.push(data.v);
                        this.setCuoPaiValue(data.v);
                    } else {
                        script.holdsData = 5;
                    }
                }
            });
        }
    },

    pleaseRob (data) {
        if (this.isPlaying()) { //正在玩
            let len = data.max+1;
            for (let i = 0; i < len; i++) {
                let btn = this.multipleList[i];
                btn.active = true;
            }
        }
    },

    rob(data) {
        let uid = data[0];
        let rob = data[1];
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setRob(rob);
        }
        //隐藏抢庄按钮
        if (uid == cc.dm.user.uid) {
            this.multipleList.forEach((el) => {
                el.active = false;
            });

            this._tipsText = '等待抢庄: ';
        }
    },

    randomDeclarering(data) {
        //清空抢庄元素
        this._model._uids.forEach((uid) => {
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.clearRobView();
            }
        }); 

        let uids = data.uids;
        //大于1个人抢庄，则播放抢庄音效
        if (uids.length > 1) {
            cc.vv.audioMgr.playSFX("public/random_banker_lianxu.mp3");
        }

        //播放抢庄动画
        if (uids.length === 1) {
            this.setTips('抢庄中: ', 1);
        } else {
            uids.forEach(uid => {
                let p = this.getPlayerByUid(uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.playRobAni(0);
                }
            });

            this.setTips('抢庄中: ', 2);
        }
    },

    randomDeclarer(data) {
        let uids = data.uids;
        let guodi = data.guodi;
        if (guodi != undefined) {
            this.setGuodi(guodi);
        }

        if (this._guodi <= 0) {
            if(this._model._decl == cc.dm.user.uid) {
                this.setTips('正在下锅底: ', 2);
            } else {
                this.setTips('等待庄家下锅底: ', 2);
            }
        }

        if (!!uids) {
            uids.forEach(uid => {
                let p = this.getPlayerByUid(uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    if (uid == this._model._decl) {
                        script.playRobAni(1);
                        script.setBank(true);
                    } else {
                        script.stopRobAni();
                    }
                }
            });
        } else {
            let p = this.getPlayerByUid(this._model._decl);
            if (!!p) {
                let script = this.playerScript(p);
                script.playRobAni(1);
                script.setBank(true);
                if (this._guodi > 0) {
                    script.setScore(undefined, true, guodi);
                }
            }
        }
        
        this.lzNode.active = false;
        this.szNode.active = false;
    },

    startBet (data) {
        if (this.betList && data.uid !== cc.dm.user.uid && this.isPlaying()) {
            if (!!cc.gameargs.rule.mpHolds) {
                this.betListNode.y = this.customBetNode.y;
                this.tips.y = this.betListNode.y+75;
            } else {
                this.betListNode.y = this.multipleListNode.y;
            }
            data.bets.forEach(function (el, i) {
                let betBtn = this.betList[i];
                betBtn.active = true;
                let lab = betBtn.getChildByName('Label');
                if (!!lab) {
                    let str = cc.utils.getScoreStr(el);
                    str = str.replace('千', 'A');
                    str = str.replace('万', 'B');
                    lab.getComponent(cc.Label).string = str;
                }
            }, this);
            this._maxBet = data.maxBet;
            if (this._maxBet > 0) {
                this._minBet = data.bets[0];
                this.setBetLabel(this._minBet);
                this.customBetNode.active = true;
            }
        }
    },

    gameStatus(data) {
        this._super(data);
        switch (this._gameStatus) {
            case cc.game_enum.status.WAIT_ZHUANG:
                this.setTips('等待玩家当庄中: ', 10);
                this.lzNode.active = false;
                this.szNode.active = false;
                break;
            case cc.game_enum.status.WAIT_BETS:
                if(this._model._decl == cc.dm.user.uid || !this.isPlaying()) {
                    this.setTips('等待玩家下注: ', 12);
                } else {
                    this.setTips('请下注: ', 12);
                }
                break;
            case cc.game_enum.status.WAIT_ROBS_OPEN:
                if(this.isPlaying()) {
                    this.setTips('请抢庄: ', 10);
                } else {
                    this.setTips('等待玩家抢庄: ', 10);
                }
                break;
            case cc.game_enum.status.CUOPAI_ONE:
                if(this.isPlaying()) {
                    this.showButton();
                }
                this.setTips('等待搓牌中: ', 15);
                break;
            default:
                break;
        }
    },

    bet (data) {
        //收到下注消息，当玩家为自己的时候，必须隐藏自己胡下注按钮
        if (data[0] == cc.dm.user.uid) {
            this.betList.forEach((el) => {
                el.active = false;
            });

            this.resetBetNode();
            this._tipsText = '等待其他玩家下注: ';
        }
        let p = this.getPlayerByUid(data[0]);
        if(!!p) {
            let script = this.playerScript(p);
            let bet = data[1];
            let sehmen = data[2];
            script.setBet(bet, sehmen);
            if (sehmen) {
                this.showShemen(script);
            }
        }
        cc.vv.audioMgr.playSFX("public/bet.mp3");
    },

    showShemen(ps) {
        let rotates = this.players.length == 6 ? this._rotates[0] : this._rotates[1];
        let spos = ps.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
        let epos = this.guodiNode.getChildByName('Label').getNodeToWorldTransformAR();

        let smfire = cc.instantiate(this.smfire);
        smfire.active = true;
        smfire.rotation = rotates[ps.localSeat];
        smfire.x = spos.tx;
        smfire.y = spos.ty;
        this.smNode.addChild(smfire);

        let ball = cc.instantiate(this.ball);
        ball.active = true;
        this.smNode.addChild(ball, 1);
        ball.x = spos.tx;
        ball.y = spos.ty;
        let ballseq = cc.sequence(cc.spawn(cc.moveTo(0.5, cc.p(epos.tx, epos.ty)), cc.rotateBy(0.5, 360)), cc.removeSelf(), cc.callFunc(() => {
            this.guodiNode.stopAllActions();
            this.guodiNode.runAction(cc.sequence(
                cc.moveTo(0.05, cc.p(-24, this.guodiNode.y)),
                cc.moveTo(0.1, cc.p(24, this.guodiNode.y)),
                cc.moveTo(0.1, cc.p(-12, this.guodiNode.y)),
                cc.moveTo(0.05, cc.p(6, this.guodiNode.y)),
                cc.moveTo(0.05, cc.p(-6, this.guodiNode.y)),
                cc.moveTo(0.05, cc.p(0, this.guodiNode.y))
            ));
        }));
        ballseq.easing(cc.easeOut(2));
        ball.runAction(ballseq);

        let fireseq = cc.sequence(cc.moveTo(0.5, cc.p(epos.tx, epos.ty)), cc.removeSelf());
        fireseq.easing(cc.easeOut(2));
        smfire.runAction(fireseq);
    },

    deal (data) {
        this._model._uids.forEach((uid) => {
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let script = this.playerScript(p);
                script.deal(data);
            }
        });

        //时间提示
        this.setTips('发牌中: ', 1);
    },

    showButton(){
        if(this._ziDongLiangPai) {
            this.onShowHolds();
        } else {
            if (!this._isFan) {
                this.fanpaiBtn.active = true;
                this.cuopaiBtn.active = true;
                this.showHoldsBtn.active = false;
            } else {
                this.fanpaiBtn.active = false;
                this.cuopaiBtn.active = false;
                this.showHoldsBtn.active = true;
            }
        }
    },

    showHolds (data) {
        let uid = data[0];
        let holds = data[1];
        let value = data[2];
        if (uid === cc.dm.user.uid) {
            this._isLiang = true;
            this.fanpaiBtn.active = false;
            this.cuopaiBtn.active = false;
            this.showHoldsBtn.active= false;
        }
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.updateResult(holds,value);
        }
    },

    /**
     * 最后实际分数
     * @param data
     */
     finalScores (data) {
        if (Array.isArray(data)) {
            data.forEach(obj=>{
                let uid = obj.uid;
                let score = obj.score;
                let p =  this.getPlayerByUid(uid);
                if(!!p) {
                    let script = this.playerScript(p);
                    script.finalScoreData = score;
                }
            });
        } else if (typeof data == "object") {
            for (let uid in data) {
                let score = data[uid];
                let p =  this.getPlayerByUid(uid);
                if(!!p) {
                    let script = this.playerScript(p);
                    script.finalScoreData = score;
                }
            }
        }
    },


    /**
     * 游戏结果
     * @param data 结果对象，一个uid对应一个分数
     */
    gameResult (data) {
        cc.find("Canvas/cuopai").active = false;

        let self = this;
        this._myReady = false;
        if (this.isPlaying()) {
            this.startEndnode();
        }

        let result = data[0];
        let zuid = data[1]; //庄家uid
        let guodi = data[2] || 0;
        this._guodi = guodi;
        let zp = this.getPlayerByUid(zuid);
        if (zp == null) {
            return;
        }

        let zscr = this.playerScript(zp);
        let goldAni = cc.find('Canvas/common/金币动画').getComponent("输金币动画");
        let zScore = 0;     //庄家输赢分
        let wins = [];      //赢分玩家
        let loses = [];     //输分玩家
        
        Object.keys(result).forEach(uid => {
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let ps = this.playerScript(p);
                let score = result[uid];
                zScore -= score;
                let obj = {scr: ps, score: score};
                if (score >= 0) {
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

        this.setGuodi(guodi);
        function losesAni() {
            loses.forEach((obj, i) => {
                obj.scr.showScore(obj.score);
                obj.scr.showFinalScore();
                if (obj.scr._uid == cc.dm.user.uid) {
                    cc.vv.audioMgr.playSFX("public/lose.mp3");
                }
                let spos = obj.scr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                let epos = self.guodiNode.getChildByName('Label').getNodeToWorldTransformAR();
                let cb = null;
                if (i == loses.length-1) {
                    cb = (() => {
                        if (wins.length == 0) {
                            self.showCurBankScore(zScore);
                            zscr.showFinalScore(guodi);
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
            //zscr.showScore(zScore);
            self.showCurBankScore(zScore);
            zscr.showFinalScore(guodi);
            if (zscr._uid == cc.dm.user.uid) {
                if (zScore > 0) {
                    cc.vv.audioMgr.playSFX("public/sng_winner.mp3");
                } else if (zScore < 0) {
                    cc.vv.audioMgr.playSFX("public/lose.mp3");
                }
            }
            wins.forEach((obj, i) => {
                if (obj.score > 0) {
                    let epos = obj.scr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                    let spos = self.guodiNode.getChildByName('Label').getNodeToWorldTransformAR();
                    let cb = (() => {
                        obj.scr.showScore(obj.score);
                        obj.scr.playSaoGuang();
                        obj.scr.showFinalScore();
                        if (obj.scr._uid == cc.dm.user.uid) {
                            cc.vv.audioMgr.playSFX("public/sng_winner.mp3");
                        }
                    });
                    goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), self._isBackGround, cb);  
                } else {
                    obj.scr.showScore(obj.score);
                    obj.scr.showFinalScore();
                }
            });
        }

        if(loses.length <= 0) {
            //庄家通赔
            if(!this._isBackGround) {
                this.tcNode.getChildByName('tongPeiNode').active = true;
                this.tcNode.getChildByName('tongPeiNode').getComponent(cc.Animation).play('tongPeiAnimationClip');
            }
        }

        if(wins.length <= 0) {
            //庄家通吃
            if(!this._isBackGround) {
                this.tcNode.getChildByName('tongChiNode').active = true;
                this.tcNode.getChildByName('tongChiNode').getComponent(cc.Animation).play('tongChiAnimationClip');
            }
        }

        this.setTips('比牌中: ', 3);

        this.scheduleOnce(function () {
            if (!!this._autoOut && this.isPlaying()) {
                this.backHall();
            }
        }, 3);
    },

    showCurBankScore(score) {
        let scoreStr = cc.utils.getScoreStr(score);
        scoreStr = scoreStr.replace('万', 'B');
        if (score < 0) {
            this.winNode.active = false;
            this.loseNode.active = true;
            this.loseNode.getComponent(cc.Label).string = scoreStr;
        } else {
            this.winNode.active = true;
            this.winNode.getComponent(cc.Label).string = '+'+scoreStr;
            this.loseNode.active = false;
        }
    },

    setGuodi(score) {
        this._guodi = score || 0;
        this.guodiNode.getComponent('scoreAni').showNum(this._guodi, true);
    },

    update:function(dt) {

    },

    /**
     * 设置提示文本
     * @param text
     * @param endTime
     */
    setTips (text, endTime) {
        this.cleanTips();
        this._tipsTime = endTime;
        this._tipsText = text;
        this.tips.active = true;
        this.nextSetTips();
    },

    nextSetTips() {
        if (this._tipsTime <= 0) {
            !!this.tips && (this.tips.active = false);
            return;
        }
        if (this.tips && this.tips.children[0]) {
            this.tips.children[0].getComponent(cc.Label).string = this._tipsText + this._tipsTime;
            this._tipsTimeout = setTimeout(() => {
                this._tipsTime -= 1;
                this.nextSetTips();
            }, 1000);
        }
    },

    cleanTips() {
        this._tipsTime = 0;
        !!this.tips && (this.tips.active = false);
        if (!!this._tipsTimeout) {
            clearTimeout(this._tipsTimeout);
        }
    },

    /**
     * 设置倍数
     */
    onSetMultiple (event, id) {
        cc.vv.audioMgr.playButtonSound();
        if (typeof id == 'number') {
            id = id.toString();
        }
        cc.connect.send("setMultiple", id);
    },

    /**
     * 下注按钮事件
     * @param event
     * @param id 0 到3
     */
    onSetBet (event, id) {
        cc.vv.audioMgr.playButtonSound();
        //此处应该在下完注后隐藏自己的下注按钮
        this.betList.forEach(function(el){
            el.active = false;
        });
        this.resetBetNode();
        cc.connect.send('bet', id);
    },

    onSetCustomBet(event, data) {
        cc.vv.audioMgr.playButtonSound();
        if (isNaN(this._bet)) {
            return;
        }

        cc.connect.send('customBet', this._bet);

        //此处应该在下完注后隐藏自己的下注按钮
        this.betList.forEach(function(el){
            el.active = false;
        });

        this.resetBetNode();
    },

    /**亮牌*/
    onShowHolds () {
        cc.vv.audioMgr.playButtonSound();
        //点击亮牌,隐藏所有的操作按钮
        cc.connect.send("showHolds");
    },
    /**翻牌*/
    onFanPai () {
        cc.vv.audioMgr.playButtonSound();
        let p = this.getPlayerByUid(cc.dm.user.uid);
        if(!!p) {
            let script = this.playerScript(p);
            this.scheduleOnce(()=> {
                if (!this._isLiang) {
                    this.showHoldsBtn.active = true;
                }
            }, 0.5);
            script.fanPai();
            this._isFan = true;
        }

        this.fanpaiBtn.active = false;
        this.cuopaiBtn.active = false;
    },

    /**准备按钮*/
    onReady () {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.ready();
    },

    /**
     * 搓单张牌
     */
    onCuoPai (event) {
        if (!cc.sys.isNative) {
            this.onFanPai();
            return;
        }

        let self = this;
        let front = cc.find("backpoker/front");
        let cuoPai = cc.find("Canvas/cuopai");
        let script = cuoPai.getChildByName("larger").getComponent("CuoPai");
        //牌背面

        let tex = script.getNode(front); //牌正面的纹理
        let backTex = script.getNode(cc.find("backpoker/back")); //牌背面
        let p = this.getPlayerByUid(cc.dm.user.uid);
        if(!!p){
            let selfScript = this.playerScript(p);
            this.cuopaiCb = function () {
                try {
                    cuoPai.active = false;
                    self.onFanPai();
                    cuoPai.getChildByName("front").active = false;
                } catch (e) {
                    console.error(e);
                }
                delete self.cuopaiCb;
            };

            script.initCfg(tex, backTex, function () {
                let tempFront = cuoPai.getChildByName("front");
                tempFront.active = true;
                tempFront.getComponent("largerPoker").playShow();
                self.scheduleOnce(self.cuopaiCb, 0.7);
            });
            cuoPai.active = true;
            //顶部四张牌
            if (selfScript) {
                let holds = selfScript.holdsData.slice(0, 4);
                this.setCuoPaiList(holds);
            }
        }
    },

    /**
     * 设置搓单张牌的牌
     */
    setCuoPaiValue (poker) {
        if (!cc.sys.isNative) {
            return;
        }

        cc.find("backpoker/front").getComponent("largerPoker").setValue(poker);
        cc.find("Canvas/cuopai/front").getComponent("largerPoker").setValue(poker);
    },

    /**
     * 搓牌顶部四张牌
     * @param pokers
     */
    setCuoPaiList (pokers) {
        cc.find("Canvas/cuopai/pokers").children.forEach(function (el, i) {
            el.getComponent("poker").show(pokers[i]);
        });
    },

    hideCuoPai () {
        let cuoPai = cc.find("Canvas/cuopai");
        let script = cuoPai.getChildByName("larger").getComponent("CuoPai");
        script.quickClose(); //快速度关闭，不触发回调
        cuoPai.getChildByName("front").active = false;
        cuoPai.active = false;
        this.unschedule(this.cuopaiCb);
    },

    /**
     * 关闭搓牌界面
     */
    onCloseCuoPai () {
        this.hideCuoPai();
        this.onFanPai();
    },

    onAutoShow () {
        if(this._ziDongLiangPai===true){
            this._ziDongLiangPai= false;
            console.log("关闭自动亮牌");
            this.autoShowBtn.getChildByName("choose").active = false;
            this.autoShowBtn.getChildByName("nochoose").active = true;

        }else{
            this._ziDongLiangPai= true;
            console.log("打开自动亮牌");
            this.autoShowBtn.getChildByName("choose").active = true;
            this.autoShowBtn.getChildByName("nochoose").active = false;
            this.onShowHolds();
        }
    },

    /**
     * 我自己离开了房间后清除一些数据
     * @param data
     */
    leave(uid, need) {
        this.cleanTips();
        this._super(uid, need);
    },

    checkBar (n, event) {
        let p = n.convertTouchToNodeSpace(event);
        let x = p.x;
        x = Math.max(0, x);
        x = Math.min(this._maxNodex, x);
        let percent = x/this._maxNodex;
        let progress = percent;
        // if (progress < 0.16) {
        //     progress += (1-progress)*0.05;
        // }
        this.customBetBar.progress = progress;
        let icon = n.getChildByName('gold');
        if (icon) {
            //icon.anchorX = percent;
            icon.x = x;
        }

        let marginBet = this._maxBet-this._minBet;
        if (marginBet <= 0) {
            return;
        }

        let curBet = Math.ceil(marginBet*percent)+this._minBet;
        curBet -= curBet%100;
        this.setBetLabel(curBet);
    },

    resetBetNode() {
        this.customBetBar.progress = 0;
        let icon = this.customBetBar.node.getChildByName('gold');
        if (icon) {
            icon.x = 0;
        }

        this.setBetLabel(0);
        this.customBetNode.active = false;
    },

    setBetLabel(bet) {
        this._bet = bet;
        let str = cc.utils.getScoreStr(bet);
        str = str.replace('千', 'A');
        str = str.replace('万', 'B');
        this.betLabel.getComponent(cc.Label).string = str;
    },

});
