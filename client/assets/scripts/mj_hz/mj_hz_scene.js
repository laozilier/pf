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
        mjPrefab: {
            default: null,
            type: cc.Prefab
        }
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        this._super();
        cc.vv.audioMgr.playBGM("bg/niuniubg.mp3");

        let single = this.node.getChildByName('single');
        // let common = this.node.getChildByName('common');
        this.liujuNode = single.getChildByName('liujuNode');            //流局动画
        this.liujuNode.active = false;
        this.actNode = single.getChildByName('actNode');
        this.remcardsNode = single.getChildByName('remcards');      //桌面剩余牌
        this.remcardsLab = this.remcardsNode.getChildByName('label');
        this.remcardsLab.active = false;

        this.turnNode = this.node.getChildByName('turnNode');
        this.tipsLine = this.node.getChildByName('tipsLine');
        this.tipsLine.active = false;
        this.aniNode = single.getChildByName('aniNode');
        this.tingNode = single.getChildByName('tingNode');
        this.tingNodes = this.tingNode.getChildByName('tingNodes');
        cc.utils.addClickEvent(this.tingNodes, this, 'mj_hz_scene', 'tingNodesPressed', 0);
        this.maxTingNodes = 12;
        for (let i = 0; i < this.maxTingNodes; i++) {
            let mjCard = cc.instantiate(this.mjPrefab);
            this.tingNodes.addChild(mjCard, i, 'mjCard'+i);
            mjCard.active = false;
        }

        let moreLab = this.tingNodes.getChildByName('more');
        moreLab.setLocalZOrder(this.maxTingNodes);
        let lessLab = this.tingNodes.getChildByName('less');
        lessLab.setLocalZOrder(this.maxTingNodes);
        this.tingNode.active = false;
        this.tingShow = true;

        this.shaiziNode = single.getChildByName('shaiziNode');
        this.shaiziPos = [cc.p(50, -160), cc.p(430, 120), cc.p(50, 200), cc.p(-330, 120)];

        this._isBackGround = false;
        //游戏退到后台
        cc.game.on(cc.game.EVENT_SHOW, this.foreGround, this);
        //游戏回到前台
        cc.game.on(cc.game.EVENT_HIDE, this.backGround, this);

        cc.connect.off('tingpai');
        cc.connect.on('tingpai', (msg) => {
            this.tingpai(msg);
        });
    },

    tingNodesPressed() {
        cc.vv.audioMgr.playButtonSound();
        if (!this.tingData) {
            this.tingpaiReset();
            return;
        }
        this.tingShow = !this.tingShow;
        this.showTingpai();
    },

    tingpaiReset() {
        for (let i = 0; i < this.maxTingNodes; i++) {
            let mjCard = this.tingNodes.getChildByName('mjCard'+i);
            if (!!mjCard) {
                mjCard.active = false;
            }
        }

        this.tingNodes.getChildByName('all').active = false;
        this.tingNode.active = false;
        this.tingShow = true;
    },

    showTingpai() {
        this.tingNode.active = true;
        let moreLab = this.tingNodes.getChildByName('more');
        let lessLab = this.tingNodes.getChildByName('less');
        if (this.tingShow) {
            moreLab.active = false;
            lessLab.active = true;
            this.tingNodes.opacity = 255;
        } else {
            moreLab.active = true;
            lessLab.active = false;
            this.tingNodes.opacity = 180;
        }

        let all = this.tingData.all;
        let allLab = this.tingNodes.getChildByName('all');
        if (!!all) {
            allLab.active = true;
            return;
        }

        allLab.active = false;
        let arr = this.tingData.arr;
        if (!!arr) {
            for (let i = 0; i < arr.length; i++) {
                let v = arr[i];
                let mjCard = this.tingNodes.getChildByName('mjCard'+i);
                if (!!mjCard) {
                    if (this.tingShow) {
                        mjCard.getComponent('mj').showTansMjValue(v);
                    } else {
                        mjCard.active = false;
                    }
                }
            }
        }
    },

    tingpai(data) {
        this.tingpaiReset();
        if (!!data) {
            this.tingData = data;
            this.tingShow = true;
            this.showTingpai();
        }
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
        this.sceneNodesReset();
    },

    /**
     * 游戏信息 父类处理完后调用
     * @param data
     */
    gameInfo (data) {
        this._super(data);

        if (data.banker > 0) {        
            this.broadcastBanker({uid: data.banker}, true);
        }

        if (data.bottomCards > 0) {                                                             //桌面牌
            this.bottomCards({len: data.bottomCards});
        }

        if (!!data.lastDiscard) {                                                               //显示上手牌
            this.discard(data.lastDiscard, true);
        }

        if (!!data.lastQiUid) {
            this.lastQiPoker(data.lastQiUid);
        }

        this.turn(data, true);

        let otherHolds = data.otherHolds;
        if (!!otherHolds) {
            for (let i = 0; i < otherHolds.length; i++) {
                let obj = otherHolds[i];
                this.otherHolds(obj);
            }
        }

        let actionHus = data.actionHus;
        if (!!actionHus) {
            for (let i = 0; i < actionHus.length; i++) {
                let obj = actionHus[i];
                this.actionHu(obj);
            }
        }
    },

    //场景重置
    sceneNodesReset() {
        this._lastDiscard = undefined;
        this._bankerUid = 0;        //庄家id
        
        this.remcardsLab.active = false;
        this.actNode.active = false;
        this.aniNode.getComponent('MjAniNode').reset();
        this.tipsLine.getComponent('MjTipsLine').reset();
        this.turnNode.getComponent('MjTurn').reset();
        this.tingpaiReset();
        this.shaiziNode.getComponent('MjShaizi').reset();
    },

    /***
     *  游戏开始
     * @param data
     */
    gameBegin (data) {
        this._super(data);
        cc.vv.audioMgr.playSFX("poker/public/kaiju.mp3");
        this.sceneNodesReset();
    },

    /***
     *  广播庄家
     * @param data
     */
    broadcastBanker(data, disconnect) {
        this._bankerUid = data.uid;
        let p = this.getPlayerByUid(this._bankerUid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setPlayerBanker(true);
            if (!disconnect) {
                this.shaiziNode.setPosition(this.shaiziPos[script.localSeat]);
                this.shaiziNode.getComponent('MjShaizi').startAction();
            }
        }
    },

    /***
     *  剩余牌数目
     * @param data
     */
    bottomCards(data) {
        let len = data.len;
        this.remcardsLab.active = true;
        this.remcardsLab.getComponent(cc.Label).string = len;
    },

    /**
     * 手牌
     * @param {*} data 
     */
    holds (data) {
        this.shaiziNode.getComponent('MjShaizi').reset();
        //没玩不处理
        if(!this.isPlaying()) {
            return;
        }

        for (let i = 0; i < this._model._uids.length; i++) {
            let uid = this._model._uids[i];
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let scr_p = this.playerScript(p);
                if (uid == cc.dm.user.uid) {
                    scr_p.setHolds(data, true);
                } else {
                    scr_p._holds = 13;
                }
                scr_p.showHolds();
            }
        } 
    },

    bankLastcard (data) {
        let p = this.getPlayerByUid(this._bankerUid);
        if (!!p) {
            let script = this.playerScript(p);
            script.bankLastcard(data);
        }
    },

    /**
     * 出牌
     * @param {*} data 
     */
    discard (data, disconnect) {
        if (!data) {
            return;
        }
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            let res = script.discard(data, disconnect);
            if (!!res) {
                res.v = data.v;
                res.localSeat = script.localSeat;
                res.sex = script._sex;
                this.aniNode.getComponent('MjAniNode').disCard(res);
            }
        }

        this._lastDiscard = data;
    },

    /**
     * 进牌
     * @param {*} data 
     */
    inPoker (data) {
        this.actNode.active = false;
        //清掉出的牌
        let out_p = undefined;
        if (!!this._lastDiscard) {
            let uid = this._lastDiscard.uid;
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let p_scr = this.playerScript(p);
                out_p = p_scr.outMJNode.getNodeToWorldTransformAR();
                out_p = cc.p(out_p.tx, out_p.ty);
                p_scr.clearOutCards();
            }
        }

        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let info = data.data;
            let res = scr_p.inPoker(info);
            if (!!res) {
                res.out_p = out_p;
                let action_p = scr_p.outMJNode.getNodeToWorldTransformAR();
                action_p = cc.p(action_p.tx, action_p.ty);
                res.action_p = action_p;
                res.localSeat = scr_p.localSeat;
                this.aniNode.getComponent('MjAniNode').inPoker(res, info);
            }
        }

        this._lastDiscard = undefined;
    },

    /**
     * 弃牌
     * @param {*} data 
     */
    qiPoker (data) {
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let script = this.playerScript(p);
            let v = data.v;
            let res = script.qiPoker(v);
            if (!!res) {
                res.v = v;
                res.localSeat = script.localSeat;
                this.aniNode.getComponent('MjAniNode').qiPoker(res);
            }
        }

        this.lastQiPoker(data.uid);
    },

    /**
     * 最后一张弃牌
     * @param {*} uid 
     */
    lastQiPoker (uid) { 
        this.players.forEach(p=> {
            let scr_p = this.playerScript(p);
            scr_p.lastQiPoker(scr_p._uid == uid);
        });
    },

    /**
     * 摸牌
     * @param {*} data 
     */
    drawCard (data) {
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let script = this.playerScript(p);
            let res = script.drawCard(data);
            res.v = data.v;
            res.localSeat = script.localSeat;
            let start = this.turnNode.getNodeToWorldTransformAR();
            start = cc.p(start.tx, start.ty);
            res.start = start;
            this.aniNode.getComponent('MjAniNode').drawCard(res);
        }

        this._lastDiscard = undefined;
    },

    /**
     * 操作
     * @param {*} data 
     */
    action (data) {
        this.actNode.getComponent('MjActNode').openActNode(data);
    },

    /**
     * 隐藏操作
     * @param {*} data 
     */
    hideAction (data) {
        this.actNode.active = false;
    },

    /**
     * 事件错误
     * @param {*} data 
     */
    eventErr (data) {
        
    },

    /**
     * 轮转
     * @param {*} data 
     */
    turn(data, disconnect) {
        let time = 30;
        this.players.forEach(p => {
            let scr = this.playerScript(p);
            if (scr._uid == data.turn) {
                scr.setTurn(true, this._gameStatus, disconnect);
                if (cc.dm.user.uid == data.turn) {
                    if (this._gameStatus == cc.game_enum.status.DISCARD) {
                        this.tipsLine.getComponent('MjTipsLine').showTipsLine();
                    } 
                }

                if (this._gameStatus == cc.game_enum.status.DISCARD || this._gameStatus == cc.game_enum.status.DRAWCARDWAIT) {
                    this.turnNode.getComponent('MjTurn').showTurn(scr.localSeat, time);
                } else {
                    this.turnNode.getComponent('MjTurn').showTurn(-1, time);
                }
            } else {
                scr.setTurn(false, this._gameStatus, disconnect);
            }
        });
    },

    /**
     * 流局
     * @param data
     * **/
    liuju(data) {
        this.turnNode.getComponent('ZpTurn').reset();

        this.liujuNode.active = true;
        this.liujuNode.getComponent(cc.Animation).play();
    },

    /**
     * 杠喜钱
     * @param {*} scores 
     */
    gangScore (scores) { 
        let winuid = 0;
        let loses = [];     //输分玩家
        /**  计算分数 */
        for (let uid in scores) {
            let score = scores[uid];
            if (score < 0) {
                loses.push(uid);
            } else if (score > 0) {
                winuid = uid;
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
                        losescr.showScore(scores[uid], true);
                        let spos = losescr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                        let epos = winscr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                        let cb = undefined;
                        if (i == loses.length-1) {
                            cb = (() => {
                                winscr.showScore(scores[winuid], true);
                                winscr.playSaoGuang();
                            });
                        }
        
                        goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), this._isBackGround, cb);  
                    }
                });
            }
        }

        if (scores[cc.dm.user.uid]) {
            if(scores[cc.dm.user.uid] >= 0){
                cc.vv.audioMgr.playSFX("poker/public/win.mp3");
            } else {
                cc.vv.audioMgr.playSFX("poker/public/lose.mp3");
            }
        } else {
            console.log("没有分数！")
        }
    },

    /**
     * 扎鸟
     * @param {*} data 
     */
    zhaniao (data) { 
        cc.vv.audioMgr.playSFX("mj/zhuaNiao.mp3");
        let res = {};
        let start = this.remcardsNode.getNodeToWorldTransformAR();
        start = cc.p(start.tx, start.ty);
        res.start = start;
        let middle = this.turnNode.getNodeToWorldTransformAR();
        middle = cc.p(middle.tx, middle.ty);
        res.middle = middle;
        let ends = [];
        for (let i = 0; i < data.length; i++) {
            let obj = data[i];
            let end = {};
            let card = obj.card;
            end.v = card;
            let uid = obj.uid;
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let scr_p = this.playerScript(p);
                let endp = scr_p.userNode.getNodeToWorldTransformAR();
                endp = cc.p(endp.tx, endp.ty);
                end.p = endp;
                ends.push(end);
            }
        }
        res.ends = ends;
        this.aniNode.getComponent('MjAniNode').zhaniao(res);
    },

    /**
     * 游戏结果
     * @param {*} data 
     */
    gameResult (data) { 
        let scores = data.scores;
        if (this.isPlaying()) {
            this._myReady = false;
            this.startEndnode(60);
            let userInfos = [];
            let playerDatas = data.playerDatas;
            let paoUid = data.paoUid;
            let huUids = data.huUids;
            let huCard = data.huCard;
            for (let uid in scores) {
                let int_uid = parseInt(uid);
                let playerData = playerDatas[uid];
                let score = scores[uid];
                let obj = {uid: int_uid};
                let userInfo = this._model.getUserInfo(parseInt(uid));
                obj.name = userInfo.name;
                obj.pic = userInfo.pic;
                obj.sex = userInfo.sex;
                obj.score = score;
                obj.halfwayScore = playerData.halfwayScore;
                obj.zhaniao = playerData.zhaniao;
                obj.inPokers = playerData.inPokers;
                obj.holds = playerData.holds;
                obj.isHu = huUids.includes(int_uid);
                if (obj.isHu) {
                    if (!paoUid) {
                        obj.isZimo = true;
                        obj.holds.shift();
                    }
                } else {
                    obj.isPao = (int_uid == paoUid);
                }
                
                obj.huCard = huCard;
                obj.isBanker = (int_uid == data.banker);
                userInfos.push(obj);
            }
    
            let resultNode = this.endNode.getChildByName('mj_hz_resultNode');
            if (!!resultNode) {
                resultNode.getComponent('mj_hz_resultNode').openRelustNode(userInfos, data.bottomCards, data.leftCards);
            } else {
                cc.utils.loadPrefabNode('mj_hz/mj_hz_resultNode', function (resultNode) {
                    this.endNode.addChild(resultNode, 1, 'mj_hz_resultNode');
                    if (this.endNode.active) {
                        resultNode.getComponent('mj_hz_resultNode').openRelustNode(userInfos, data.bottomCards, data.leftCards);
                    }
                }.bind(this));
            }
        }

        let winuid = 0;
        let loses = [];     //输分玩家
        /**  计算分数 */
        for (let uid in scores) {
            let score = scores[uid];
            if (score < 0) {
                loses.push(uid);
            } else if (score > 0) {
                winuid = uid;
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
                        losescr.showScore(scores[uid]);
                        let spos = losescr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                        let epos = winscr.userNode.getChildByName('headNode').getNodeToWorldTransformAR();
                        let cb = undefined;
                        if (i == loses.length-1) {
                            cb = (() => {
                                winscr.showScore(scores[winuid]);
                                winscr.playSaoGuang();
                            });
                        }
        
                        goldAni.flyGolds(cc.p(spos.tx, spos.ty), cc.p(epos.tx, epos.ty), this._isBackGround, cb);  
                    }
                });
            }
        }

        if (scores[cc.dm.user.uid]) {
            if(scores[cc.dm.user.uid] >= 0){
                cc.vv.audioMgr.playSFX("poker/public/win.mp3");
            } else {
                cc.vv.audioMgr.playSFX("poker/public/lose.mp3");
            }
        } else {
            console.log("没有分数！")
        }
    },

    /**
     * 状态切换
     * @param {*} data 
     */
    gameStatus (data) { 
        this._super(data);
        this.tipsLine.getComponent('MjTipsLine').reset();
        let time = 30;
        if (this._gameStatus == cc.game_enum.status.DISCARDWAIT) {
            this.turnNode.getComponent('MjTurn').showTurn(-1, time);
            this.players.forEach(p => {
                let scr = this.playerScript(p);
                scr.setTurn(false, false);
            });
        }
    },

    /**
     * 其他人手牌
     * @param {*} data 
     */
    otherHolds (data) {
        let uid = data.uid;
        let holds = data.holds;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            this.playerScript(p).otherHolds(holds);
        }
    },

    /**
     * 胡牌操作 播放胡动画
     * @param {*} data 
     */
    actionHu (data) {
        let uid = data.uid;
        let huType = data.huType;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let action_p = scr_p.outMJNode.getNodeToWorldTransformAR();
            action_p = cc.p(action_p.tx, action_p.ty);
            scr_p.actionHu(huType);
            this.aniNode.getComponent('MjAniNode').actionHu(action_p, huType);
            /** 点炮的用户手牌变色 */
            if (!!data.paoUid) {
                let idx = data.idx || 0;
                let paoUid = data.paoUid;
                let dianpao_p = this.getPlayerByUid(paoUid);
                if (!!dianpao_p) {
                    let scr_dianpao_p = this.playerScript(dianpao_p);
                    scr_dianpao_p.dianpao(idx);
                }
            }
        }
    },

    update:function(dt) {

    },

    // onChatBtnPressed () {
    //     this.zhaniao([
    //         {"card":16,"uid":203542},{"card":5,"uid":725859},{"card":4,"uid":203542},
    //         {"card":29,"uid":725859},{"card":8,"uid":203542},{"card":23,"uid":725859}
    //     ]);
    //     this.gameResult({
    //         banker: 203542,
    //         bottomCards: [15, 21, 5, 35, 26, 14, 11, 8, 12, 14, 21, 21, 21, 16, 9, 19, 15, 5, 2, 6, 1, 28, 14, 9, 17, 9, 17, 25, 4, 19, 4, 7, 9, 23, 7, 26, 22, 12, 22, 28, 19, 23, 17, 35, 13, 28],
    //         huCard: 8,
    //         huUids: [203542],
    //         leftCards: [[35, 35, 2, 3, 5, 6, 8, 12, 14, 15, 24, 25, 26], [2, 3, 6, 11, 13, 16, 18, 18, 23, 27, 28, 29, 29]],
    //         paoUid: 725859,
    //         playerDatas: {
    //             725859: {halfwayScore: 0, holds: [1, 2, 3, 8, 11, 12, 13, 15, 16, 18, 24, 25, 26], inPokers: []},
    //             203542: {halfwayScore: 0, inPokers: [], holds: [1, 1, 3, 4, 5, 6, 7, 16, 17, 18, 27, 27, 27], zhaniao: [
    //                     {"card":16,"uid":203542},{"card":5,"uid":725859},{"card":4,"uid":203542},
    //                     {"card":29,"uid":725859},{"card":8,"uid":203542},{"card":23,"uid":725859}
    //                 ]}
    //         },
    //         scores: {725859: -10000, 203542: 10000}
    //     });

    //     this.gangScore({725859: -50000, 934220: 50000});
    // }
});
