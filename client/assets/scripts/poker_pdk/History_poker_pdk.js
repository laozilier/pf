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

        let single = this.node.getChildByName('single');
        this.leftCardsNode = single.getChildByName('poker_pdk_leftCards');
    },

    sceneNodesReset() {
        this._super();

        this.lastCards = undefined;
        this.leftCardsNode.getComponent('poker_pdk_leftCards').reset();
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
                    p = this.players[1];
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
                scr_p.resetHolds([].concat(holds));
            }
        });

        let banker = this._playback.banker;
        if (banker > 0) {
            this.broadcastBanker({uid: banker});
        }

        let leftCards = this._playback.leftCards;
        if (Array.isArray(leftCards) && leftCards.length > 0) {
            this.leftCardsNode.getComponent('poker_pdk_leftCards').openLeftCards(leftCards);
        }

        this.eventlist = {};
        this.eventlist['discard'] = this.discard;       /** 出牌*/
        this.eventlist['pass'] = this.pass;             /** 不要*/
        this.eventlist['bomb_score'] = this.bomb_score; /** 炸弹分*/
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
     * 出牌
     * @param data
     */
    discard(data) {
        if (!data) {
            return;
        }

        if (!!this.lastCards) {
            let uid = this.lastCards.uid;
            let p = this.getPlayerByUid(uid);
            if (!!p) {
                let scr_p = this.playerScript(p);
                scr_p.clearOutCards();
            }
        }

        this.lastCards = data;
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.discard(data);
        }
    },

    /**
     * 不要
     * @param data
     */
    pass(data) {
        let uid = data.uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.pass();
        }
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
});


