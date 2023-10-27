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

    onLoad () {
        this._super();

        let single = this.node.getChildByName('single');
        this.singleNode = single;
        this.remcardsNode = single.getChildByName('remcards');           //桌面剩余牌
        this.remcardsLab = this.remcardsNode.getChildByName('label');
        this.remcardsLab.active = false;
        this.aniNode = this.node.getChildByName('aniNode');
    },

    //场景重置
    sceneNodesReset() {
        this._super();

        this.remcardsLab.active = false;
        this.aniNode.getComponent('MjAniNode').reset();
    },

    /**
     * 准备开始
     */
    prepareRecord() {
        this._super();

        this._uids.forEach((uid, idx) => {
            let p = undefined;
            if (this._uids.length == 2) {
                if (idx == 1) {
                    p = this.players[2];
                } else {
                    p = this.players[idx];
                }
            } else if (this._uids.length == 3) {
                if (idx == 2) {
                    p = this.players[3];
                } else {
                    p = this.players[idx];
                }
            } else {
                p = this.players[idx];
            }

            if (!!p) {
                let scr_p = this.playerScript(p);
                p.active = true;
                let info = this._userinfos[uid];
                let score = this._scores[uid];
                scr_p.setUserInfo(info, score, uid);
                let holds = this._playback[uid].holds;
                scr_p.setHolds([].concat(holds));
                scr_p.showHolds(false, false);
            }
        });

        let banker = this._playback.banker;
        if (banker > 0) {
            this.broadcastBanker({uid: banker});
        }

        let len = this._playback.bottomCards.length;
        if (len > 0) {                                                             //桌面牌
            this.bottomCards({len: len});
        }

        this.eventlist = {};
        this.eventlist['discard'] = this.discard;           /** 出牌*/
        this.eventlist['bankLastcard'] = this.bankLastcard;         /** 庄家拿最后一张牌*/
        this.eventlist['inPoker'] = this.inPoker;           /** 吃 碰 进牌*/
        this.eventlist['drawCard'] = this.drawCard;         /** 摸牌*/
        this.eventlist['qiPai'] = this.qiPoker;             /** 弃牌*/
        this.eventlist['bottomCards'] = this.bottomCards;   /** 桌面剩余牌数*/
        this.eventlist['gangScore'] = this.gangScore;       /** 杠牌得分*/
        this.eventlist['actionHu'] = this.actionHu;         /** 胡牌操作 播放胡动画*/
        this.eventlist['zhaniao'] = this.zhaniao;           /** 播放扎鸟动画*/
        
        this.playRecored();
    },

    playRecored() {
        this.schedule(this.nextPlayRecored, 1);
    },

    /**
     * 开始播放
     */
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
     * 庄家最后一张牌
     * @param data
     */
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
    discard (data) {
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
            this.aniNode.getComponent('MjAniNode').drawCard(res);
        }

        this._lastDiscard = undefined;
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
                let winscr = this.playerScript(winp);
                winscr.showScore(scores[winuid], true);
                loses.forEach((uid, i) => {
                    let p = this.getPlayerByUid(uid);
                    if (!!p) {
                        let losescr = this.playerScript(p);
                        losescr.showScore(scores[uid], true);
                    }
                });
            }
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
            scr_p.zimo();
            let action_p = scr_p.outMJNode.getNodeToWorldTransformAR();
            action_p = cc.p(action_p.tx, action_p.ty);
            this.aniNode.getComponent('MjAniNode').actionHu(action_p, huType);
        }

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
    },

    /**
     * 扎鸟
     * @param {*} data 
     */
     zhaniao (data) { 
        let res = {};
        let start = this.remcardsNode.getNodeToWorldTransformAR();
        start = cc.p(start.tx, start.ty);
        res.start = start;
        let middle = this.singleNode.getNodeToWorldTransformAR();
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
});
