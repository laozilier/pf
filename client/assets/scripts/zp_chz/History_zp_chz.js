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
    extends: require('../games/History_Game'),
    properties: {
        
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad() {
        this._super();
        cc.zp_chz_enum = require('zp_chz_enum');
        
        let single = this.node.getChildByName('single');
        this.remcardsNode = single.getChildByName('remcards');           //桌面剩余牌
        this.remcardsSprs = this.remcardsNode.getChildByName('sprs');
        this.remcardsLab = this.remcardsNode.getChildByName('label');
        this.remcardsLab.active = false;
        this.aniNode = single.getChildByName('aniNode');
    },

    //场景重置
    sceneNodesReset() {
        this._super();

        //桌面剩余牌节点
        this.remcardsSprs.children.forEach(el => {
            el.active = true;
        });
        this.remcardsLab.active = false;
        this.aniNode.getComponent('ZpAniNode').reset();
    },

    /**
     * 准备开始
     */
    prepareRecord() {
        this._super();

        this._uids.forEach((uid, idx) => {
            let p = this.players[idx];
            if (!!p) {
                let scr_p = this.playerScript(p);
                p.active = true;
                let info = this._userinfos[uid];
                let score = this._scores[uid];
                scr_p.setUserInfo(info, score, uid);
                let holds = this._playback[uid].holds;
                scr_p.resetHolds([].concat(holds));
                let piaofenScore = this._playback[uid].piaofenScore;
                scr_p.piaofen(piaofenScore);
            }
        });

        let banker = this._playback.banker;
        if (banker > 0) {        
            this.broadcastBanker({uid: banker});
        }

        this.eventlist = {};
        this.eventlist['discard'] = this.discard;           /** 出牌*/
        this.eventlist['bankLastcard'] = this.bankLastcard;         /** 庄家拿最后一张牌*/
        this.eventlist['inPoker'] = this.inPoker;           /** 吃 碰 进牌*/
        this.eventlist['drawCard'] = this.drawCard;         /** 摸牌*/
        this.eventlist['qiPai'] = this.qiPai;               /** 弃牌*/
        this.eventlist['bottomCards'] = this.bottomCards;   /** 桌面剩余牌数*/
        this.eventlist['fanxing'] = this.fanxing;           /** 翻醒*/
        this.eventlist['addHolds'] = this.addHolds;         /** 摸到赖子时加入手牌*/
        this.eventlist['actionHu'] = this.actionHu;         /** 胡牌操作 播放胡动画*/
        this.eventlist['sishou'] = this.sishou;             /** 玩家死手*/

        this.playRecored();
    },

    /**
     * 开始播放
     */
    playRecored() {
        this.schedule(this.nextPlayRecored, 1);
    },

    nextPlayRecored() {
        if (this._step >= this._steps.length) {
            this.pauseBtn.active = false;
            this.resumeBtn.active = false;
            this.replayBtn.active = true;

            this.unschedule(this.nextPlayRecored);
            return;
        }
        
        let step = this._steps[this._step];
        let event = step.event;
        let msg = step.msg;
        if (typeof msg == 'string') {
            msg = JSON.parse(msg);
        }

        let func = this.eventlist[event];
        if (!!func) {
            func.call(this, msg);
        } else {
            console.error('没有找到监听方法 event = ', event, ' msg = ', msg);
        }

        this._step+=1;
        this.stepLab.getComponent(cc.Label).string = this._step+' / '+this._steps.length;
        if (event == 'bottomCards') {
            this.nextPlayRecored();
        }
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
        let uid = data.uid;
        this._bankerUid = uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setPlayerBanker(true);
        }
    },

    /**
     * 翻醒
     * @param data
     * **/
    fanxing(data) {
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

    inPoker(data) {
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

        this._lastDiscard = null;
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
     * 出牌
     * @param data
     */
    discard(data) {
        if (!data) {
            return;
        }
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            let res = script.discard(data);
            if (!!res) {
                res.v = data.v;
                res.rotated = script.localSeat == 0;
                this.aniNode.getComponent('ZpAniNode').discard(res);
            }
        }

        this._lastDiscard = data;
    },
});

