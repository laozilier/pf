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

        cc.zp_chz_enum = require('zp_chz_enum');
        let single = this.node.getChildByName('single');

        this.bandianNode = single.getChildByName('bandianNode');
        this.zpNodes = this.bandianNode.getChildByName('zpNodes');
        this.bandianNode.active = false;
        this.tipsNode = single.getChildByName('tipsNode');
        this.tipsNode.getComponent('ZpTips').reset();

        this.liujuNode = single.getChildByName('liujuNode');            //流局动画
        this.liujuNode.active = false;
        this.actNode = single.getChildByName('actNode');
        this.remcardsNode = single.getChildByName('remcards');          //桌面剩余牌
        this.remcardsSprs = this.remcardsNode.getChildByName('sprs');
        this.remcardsLab = this.remcardsNode.getChildByName('label');
        this.remcardsLab.active = false;

        this.turnNode = single.getChildByName('turnNode');
        this.tipsLine = this.node.getChildByName('tipsLine');
        this.tipsLine.active = false;
        this.aniNode = single.getChildByName('aniNode');
        this.tingNode = single.getChildByName('tingNode');
        this.tingNodes = this.tingNode.getChildByName('tingNodes');
        let zp0 = this.tingNodes.getChildByName('zp0');
        for (let i = 1; i < 21; i++) {
            let zp = cc.instantiate(zp0);
            this.tingNodes.addChild(zp, i, 'zp'+i);
            zp.active = false;
        }
        this.tingNode.active = false;
        this.piaofenNode = single.getChildByName('piaofenList');
        /** 飘分按钮列表 **/
        for (let i = 0; i < 4; i++) {
            let btn = this.piaofenNode.getChildByName('btn'+i);
            if (!!btn) {
                cc.utils.addClickEvent(btn, this, this._gameName+'_scene', 'piaofenBtnPressed', i.toString());
            }
        }

        this._quid = 0;                            //切牌Uid
        this._bankerUid = 0;

        this._isBackGround = false;
        cc.game.on(cc.game.EVENT_SHOW, this.foreGround, this);
        cc.game.on(cc.game.EVENT_HIDE, this.backGround, this);

        cc.connect.off('tingpai');
        cc.connect.on('tingpai', (msg) => {
            this.tingpai(msg);
        });
    },

    tingpaiReset() {
        for (let i = 0; i < 21; i++) {
            let zp = this.tingNodes.getChildByName('zp'+i);
            if (!!zp) {
                zp.active = false;
            }
        }

        this.tingNodes.getChildByName('wangdiao').active = false;
        this.tingNodes.getChildByName('wangchuang').active = false;
        this.tingNodes.getChildByName('wangzha').active = false;
        this.tingNode.active = false;
    },

    tingpai(data) {
        if (!!data) {
            this.tingNode.active = true;
            let wangzha = data.wangzha;
            if (!!wangzha) {
                let n = this.tingNodes.getChildByName('wangzha');
                if (!!n) { n.active = true; }
                return;
            }
            let wangchuang = data.wangchuang;
            if (!!wangchuang) {
                let n = this.tingNodes.getChildByName('wangchuang');
                if (!!n) { n.active = true; }
                return;
            }
            let wangdiao = data.wangdiao;
            if (!!wangdiao) {
                let n = this.tingNodes.getChildByName('wangdiao');
                if (!!n) { n.active = true; }
                return;
            }

            let arr = data.arr;
            if (!!arr) {
                for (let i = 0; i < arr.length; i++) {
                    let v = arr[i];
                    let zp = this.tingNodes.getChildByName('zp'+i);
                    if (!!zp) {
                        zp.getComponent('Zipai').showZPValue(v);
                    }
                }
            }
        } else {
            this.tingpaiReset();
        }
    },

    foreGround() {
        this._isBackGround = false;
    },

    backGround() {
        this._isBackGround = true;
    },

    onRoomInfo(need) {
        this._super(need);

        this.sceneNodesReset();
    },

    //场景重置
    sceneNodesReset() {
        this._lastDiscard = undefined;
        this._bankerUid = 0;        //庄家id
        this.tipsNode.getComponent('ZpTips').reset();

        //桌面剩余牌节点
        this.remcardsSprs.children.forEach(el => {
            el.active = true;
        });
        this.remcardsLab.active = false;
        this.actNode.active = false;
        this.bandianNode.active = false;
        this.aniNode.getComponent('ZpAniNode').reset();
        this.tipsLine.getComponent('ZpTipsLine').reset();

        this.piaofenNode.active = false;

        this.tingpaiReset();
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
     *  断线重连游戏信息
     * @param data
     */
    gameInfo(data) {
        this._super(data);
        
        if (data.banker > 0) {        
            this.broadcastBanker({uid: data.banker});
        }
        
        if (this._gameStatus == cc.zp_chz_enum.status.PIAOFEN) {
            let me = data.players[cc.dm.user.uid];
            if (!!me) {
                let alreadyPiao = me.alreadyPiao;
                this.tipsNode.getComponent('ZpTips').openZpTips(alreadyPiao ? '等待其他玩家飘分' : '请选择飘分');
                if (!alreadyPiao) {
                    this.askPiaofen(data.piaofenScores);
                }
            }
        }

        if (data.bottomCards > 0) {                                                             //桌面牌
            this.bottomCards({len: data.bottomCards});
        }

        if (!!data.lastDiscard) {                                                               //显示上手牌
            cc.gameargs.lastCard = data.lastDiscard;
            if (!!data.lastDiscard.d) {
                this.drawCard(data.lastDiscard);
            } else {
                this.discard(data.lastDiscard, true);
            }
        }

        if (!!data.xingInfo) {
            this.fanxing(data.xingInfo);
        }

        this.turn(data);
    },

    /**
     * 状态切换
     * @param data
     */
    gameStatus(data) {
        this._super(data);
        this.tipsLine.getComponent('ZpTipsLine').reset();
        let time = 60;
        if (this._gameStatus == cc.zp_chz_enum.status.DISCARDWAIT) {
            this.turnNode.getComponent('ZpTurn').showTurn(-1, time);
            this.players.forEach(p => {
                let scr = this.playerScript(p);
                scr.setTurn(false, false);
            });
        }
    },

    /**
     * 显示搬点节点
     */
    showBandianNode(data) {
        if (this.bandianNode.active) {
            return;
        }

        this.bandianNode.active = true;
        let wangNum = this._model._game_rule.wangNum;
        let maxCount = 20+(wangNum > 0 ? 1 : 0);
        if (this.zpNodes.children.length < 20) {
            let ori_n = this.zpNodes.getChildByName('bg0');
            cc.utils.addClickEvent(ori_n, this, 'zp_chz_scene', 'bandianNodePressed', '0');
            for (let i = 1; i < maxCount; i++) {
                let el = cc.instantiate(ori_n);
                this.zpNodes.addChild(el, i, 'bg'+i);
                el.getComponent(cc.Button).clickEvents[0].customEventData = i.toString();
            }
        }

        let maringx = 40;//160/(maxCount-1);
        let startx = 0;
        if (maxCount%2 == 0) {
            startx = -maringx*maxCount/2+maringx/2;
        } else {
            startx = -maringx*(maxCount-1)/2;
        }
        let x = startx;
        for (let i = 0; i < maxCount; i++) {
            let el = this.zpNodes.getChildByName('bg'+i);
            el.stopAllActions();
            el.x = startx;
            let zp = el.getChildByName('zipai');
            zp.getComponent('Zipai').showZPValue();
            el.setLocalZOrder(i);
            el.removeChildByTag(99999, true);
            if (!!data) {
                for (let key in data) {
                    let obj = data[key];
                    let idx = obj.idx;
                    if (idx == i) {
                        zp.getComponent('Zipai').showZPValue(obj.v);
                        el.setLocalZOrder(99);
                        let p = this.getPlayerByUid(key);
                        if (!!p) {
                            let headNode = cc.instantiate(this.playerScript(p).headNode);
                            headNode.scale = 0.6;
                            el.addChild(headNode, 1, 99999);
                        }
                    }
                }
            }
            el.runAction(cc.moveTo(0.01*i, cc.p(x, 0)));
            x+=maringx;
        }
    },

    /**
     * 隐藏搬点节点
     */
    hideBandianNode(idx) {
        if (isNaN(idx)) {
            return;
        }

        let wangNum = this._model._game_rule.wangNum;
        let maxCount = 20+(wangNum > 0 ? 1 : 0);
        let dealyHideTime = this._model._game_rule.piaofen > 0 ? 0.1 : 1;
        for (let i = 0; i < maxCount; i++) {
            let el = this.zpNodes.getChildByName('bg'+i);
            el.stopAllActions();
            let zp = el.getChildByName('zipai');
            let scr_zp = zp.getComponent('Zipai');
            if (idx != i) {
                el.setLocalZOrder(i);
                if (!isNaN(scr_zp._value)) {
                    scr_zp.showZPValue();
                }
            } else {
                setTimeout(() => {
                    el.removeChildByTag(99999, true);
                    scr_zp.showZPValue();
                }, 600);
            }
            
            let act = undefined;
            if (i == maxCount-1) {
                act = cc.sequence(cc.moveTo(0.3, cc.p(0, 0)), cc.delayTime(dealyHideTime), cc.callFunc(()=> {
                    this.bandianNode.active = false;
                }));
            } else {
                act = cc.moveTo(0.3, cc.p(0, 0));
            }
            el.runAction(act);
        }
    },

    bandianNodePressed(event, data) {
        let idx = parseInt(data);
        cc.connect.send('bandian', idx);
    },

    bandian(data) {
        let idx = data.idx;
        let v = data.v;
        let el = this.zpNodes.getChildByName('bg'+idx);
        el.setLocalZOrder(99);
        let zp = el.getChildByName('zipai');
        zp.getComponent('Zipai').tran_ani(v);
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let headNode = cc.instantiate(this.playerScript(p).headNode);
            headNode.scale = 0.6;
            el.addChild(headNode, 1, 99999);
            headNode.active = false;
            setTimeout(()=> {
                headNode.active = true;
            }, 500);
        }
    },

    /***
     *  轮转
     * @param data
     */
    turn(data) {
        let can = false;
        this.tipsNode.getComponent('ZpTips').reset();
        let time = 60;
        switch (this._gameStatus) {
            case cc.zp_chz_enum.status.BANDIAN:     //搬点状态
                let bandian = data.bandian;
                this.showBandianNode(bandian);
                let userData = this._model.getUserInfo(data.turn);
                let tipsStr = '';
                if (data.turn == cc.dm.user.uid) {
                    tipsStr = '请搬点';
                } else {
                    tipsStr = `等待玩家 ${cc.utils.fromBase64(userData.name, 8)} 搬点`;
                }
                this.tipsNode.getComponent('ZpTips').openZpTips(tipsStr, 10);
                time = 10;
                break;
            case cc.zp_chz_enum.status.CUTCARD:    //切牌状态
                time = 10;
                break;
            case cc.zp_chz_enum.status.DISCARD:     //出牌状态
                can = true;
                break;
            case cc.zp_chz_enum.status.SETTLE:      //结算状态
                break;
        }

        this.players.forEach(p => {
            let scr = this.playerScript(p);
            if (scr._uid == data.turn) {
                scr.setTurn(true, can);
                this.turnNode.getComponent('ZpTurn').showTurn(scr.localSeat, time);
                if (can && cc.dm.user.uid == data.turn) {
                    this.tipsLine.getComponent('ZpTipsLine').showTipsLine();
                }
            } else {
                scr.setTurn(false, false);
            }
        });
    },

    /***
     *  抓牌
     * @param data
     */
    holdArrays(data) {
        this.tipsNode.getComponent('ZpTips').reset();
        //没玩不处理
        if(!this.isPlaying()) {
            return;
        }

        let script = this.playerScript(this.players[0]);
        let pos = this.bandianNode.getNodeToWorldTransformAR();
        pos = cc.p(pos.tx, pos.ty);
        pos = script.holdsNode.convertToNodeSpaceAR(pos);
        script.resetHolds(data, pos);
    },

    /**
     * 桌面剩余牌数
     * @param data
     * **/
    bottomCards(data) {
        let len = data.len;
        this.remcardsSprs.active = true;
        this.remcardsLab.active = true;
        this.remcardsLab.getComponent(cc.Label).string = len;
        this.remcardsSprs.children.forEach((el, idx) => {
            el.active = idx < len;
        });
    },

    /**
     * * 庄家
     *  @param data
     * */
    broadcastBanker(data) {
        this.tipsNode.getComponent('ZpTips').reset();
        this._bankerUid = data.uid;
        let p = this.getPlayerByUid(this._bankerUid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setPlayerBanker(true);
        }

        this.hideBandianNode(data.idx);
    },

    /***
     *  询问飘分
     * @param data
     */
    askPiaofen(data) {
        this.piaofenNode.active = true;
        this.piaofenNode.children.forEach((el)=> {
            el.active = false;
        });
        for (let i = 0; i < data.length; i++) {
            let btn = this.piaofenNode.getChildByName('btn'+i);
            btn.active = true;
            let score = data[i];
            let str = cc.utils.getScoreStr(score);
            str = str.replace('万', 'B');
            btn.getChildByName('Label').getComponent(cc.Label).string = str;
        }

        this.turnNode.getComponent('ZpTurn').showTurn(-1, 15);
        if (this.isPlaying()) {
            this.tipsNode.getComponent('ZpTips').openZpTips('请选择飘分');
        } else {
            this.tipsNode.getComponent('ZpTips').openZpTips('等待其他玩家飘分');
        }
    },

    /**
     * 选择飘分
     * @param event
     * @param data
     */
    piaofenBtnPressed(event, data) {
        cc.vv.audioMgr.playButtonSound();
        cc.connect.send('piaofen', data);
        this.piaofenNode.active = false;
    },

    /***
     *  飘分
     * @param data
     */
    piaofen(data) {
        let uid = data.uid;
        let piaofenScore = data.piaofenScore;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.piaofen(piaofenScore);
        }

        if (uid == cc.dm.user.uid) {
            this.tipsNode.getComponent('ZpTips').openZpTips('等待其他玩家飘分');
            this.piaofenNode.active = false;
        }
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
     * 翻醒
     * @param data
     * **/
    fanxing(data) {
        this.actNode.active = false;
        cc.vv.audioMgr.playSFX("public/fapai.mp3");
        this.remcardsLab.active = false;
        let p = this.remcardsSprs.getNodeToWorldTransformAR();
        p = cc.p(p.tx, p.ty);
        this.aniNode.getComponent('ZpAniNode').fanxing(p, data);
    },

    /**
     *摸牌
     * */
    bankLastcard(data) {
        let p = this.getPlayerByUid(this._bankerUid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let start = this.remcardsSprs.getNodeToWorldTransformAR();
            start = cc.p(start.tx, start.ty);
            let to = scr_p.outZPNode.getNodeToWorldTransformAR();
            to = cc.p(to.tx, to.ty);
            let end = scr_p.bankLastcard(data);
            this.aniNode.getComponent('ZpAniNode').bankLastcard(start, to, end, data, scr_p.localSeat == 0);
        }
    },

    /**
     * 添加牌到手牌
     * @param {*} data 
     */
    addHolds(data) {
        let uid = data.uid;
        let v = data.v;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let res = scr_p.addHolds(v);
            let start = res.start;
            let end = res.end;
            if (!!end) {} else {
                end = scr_p.userNode.getNodeToWorldTransformAR();
                end = cc.p(end.tx, end.ty);
            }
            this.aniNode.getComponent('ZpAniNode').addHolds(start, end, v, scr_p.localSeat == 0);
        }
    },

    /**
     * 玩家操作胡牌
     * @param {*} data 
     */
    actionHu(data) {
        this.turnNode.getComponent('ZpTurn').reset();
        let uid = data.uid;
        let huType = data.huType;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let res = scr_p.actionHu(huType);
            let action_p = scr_p.outZPNode.getNodeToWorldTransformAR();
            action_p = cc.p(action_p.tx, action_p.ty);
            if (huType > 2) {
                if (scr_p.localSeat == 0) {
                    action_p.x += 160;
                } else if (scr_p.localSeat == 1) {
                    action_p.x += 160;
                } else {
                    action_p.x -= 160;
                }
            }
            
            this.aniNode.getComponent('ZpAniNode').actionHu(res, data, scr_p.localSeat == 0, action_p);
        }
    },

    /**
     * 玩家死手
     * @param {*} uid 
     */
    sishou(uid) {
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let action_p = scr_p.sishou();
            this.aniNode.getComponent('ZpAniNode').sishou(action_p);
        }
    },

    hideAction() {
        this.actNode.active = false;
    },

    inPoker(data) {
        this.actNode.active = false;
        //清掉出的牌
        let out_p = cc.p(0, 0);
        let rotated = false;
        if (!!this._lastDiscard) {
            let uid = this._lastDiscard.uid;
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let p_scr = this.playerScript(p);
                out_p = p_scr.outZPNode.getNodeToWorldTransformAR();
                p_scr.clearOutCards();
                rotated = p_scr.localSeat == 0;
            }
        }

        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            let info = data.data;
            let res = scr_p.inPoker(info, out_p);
            let action_p = scr_p.outZPNode.getNodeToWorldTransformAR();
            action_p = cc.p(action_p.tx, action_p.ty);
            if (!this._lastDiscard || this._lastDiscard.uid == scr_p._uid) {
                if (scr_p.localSeat == 0) {
                    action_p.x += 140;
                } else if (scr_p.localSeat == 1) {
                    action_p.x += 140;
                } else {
                    action_p.x -= 140;
                }
            }
            this.aniNode.getComponent('ZpAniNode').inPoker(res, info, rotated, action_p);
        }

        this._lastDiscard = undefined;
    },

    /**
     * 弃牌
     * @param data
     * **/
    qiPai(data) {
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let script = this.playerScript(p);
            let res = script.qiPoker(data);
            this.aniNode.getComponent('ZpAniNode').qiPoker(res, data, script.localSeat == 0);
        }
    },

    /**
     * 摸牌
     * @param data
     */
    drawCard(data) {
        let p = this.getPlayerByUid(data.uid);
        if (!!p) {
            let script = this.playerScript(p);
            let start = this.remcardsNode.getNodeToWorldTransformAR();
            start = cc.p(start.tx, start.ty);
            let end = script.drawCard(data);
            this.aniNode.getComponent('ZpAniNode').drawCard(start, end, data.v, script.localSeat == 0, data.hu);
        }

        this._lastDiscard = data;
    },

    /**
     *
     chi: 1,
     peng: 2,
     hu: 3,
     wangdiao: 4,
     wangchuang: 5,
     wangzha: 6,
     * */
    action(data) {
        //t: 1, v: 3, data: Array(2)
        this.actNode.getComponent('ZpActNode').openActNode(data);
    },

    /**
     * 出牌错误
     * @param {*} msg 
     */
    discardErr(msg) {
        let p = this.getPlayerByUid(cc.dm.user.uid);
        if (!!p) {
            let scr_p = this.playerScript(p);
            scr_p.discardErr(msg);
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
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            let res = script.discard(data, disconnect);
            if (!!res) {
                res.v = data.v;
                res.rotated = (script.localSeat == 0);
                this.aniNode.getComponent('ZpAniNode').discard(res);
            }
        }

        this._lastDiscard = data;
    },

    /**
     * 游戏提示
     * @param data
     */
    error(data) {
        cc.utils.openWeakTips(data || '未知错误');
    },

    /**
     * 游戏结果
     * @param data
     */
    gameResult(data) {
        this.turnNode.getComponent('ZpTurn').reset();
        let scores = data.scores;
        if (this.isPlaying()) {
            this._myReady = false;
            this.startEndnode(60);
            let res = data.data;
            let userInfos = [];
            let playerPiaofenScores = data.playerPiaofenScores;
            for (let uid in scores) {
                let score = scores[uid];
                let obj = {uid: parseInt(uid)};
                let userInfo = this._model.getUserInfo(parseInt(uid));
                obj.name = userInfo.name;
                obj.pic = userInfo.pic;
                obj.sex = userInfo.sex;
                obj.score = score;
                obj.isBanker = (parseInt(uid) == data.banker);
                obj.piaofenScore = playerPiaofenScores[uid];
                if (!!res) {
                    if (score > 0) {
                        userInfos.unshift(obj);
                    } else {
                        userInfos.push(obj);
                    }
                } else {
                    if (score < 0) {
                        userInfos.unshift(obj);
                    } else {
                        userInfos.push(obj);
                    }
                }
            }
    
            let resultNode = this.endNode.getChildByName('zp_chz_resultNode');
            if (!!resultNode) {
                resultNode.getComponent('zp_chz_resultNode').openRelustNode(res, userInfos, data.bottomCards, data.leftCards, this._model._game_rule.fanxing);
            } else {
                cc.utils.loadPrefabNode('zp_chz/zp_chz_resultNode', function (resultNode) {
                    this.endNode.addChild(resultNode, 1, 'zp_chz_resultNode');
                    if (this.endNode.active) {
                        resultNode.getComponent('zp_chz_resultNode').openRelustNode(res, userInfos, data.bottomCards, data.leftCards, this._model._game_rule.fanxing);
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

        if(scores[cc.dm.user.uid]) {
            if(scores[cc.dm.user.uid] >= 0){
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
});

