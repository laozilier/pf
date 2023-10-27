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
        this.callinfo = single.getChildByName('poker_sbf_callinfo');
        this.aniNode = single.getChildByName('poker_ani');

        this.tableScoreNode = single.getChildByName('tableScore');
        this.tableScoreNode.getComponent(cc.Label).string = '';
    },

    //场景重置
    sceneNodesReset() {
        this._super();

        this.callinfo.getComponent('poker_sbf_callinfo').reset();
        this.tableScoreNode.getComponent(cc.Label).string = '';
        this.aniNode.getComponent('poker_ani').reset();
    },

    /**
     * 准备开始
     */
    prepareRecord() {
        this._super();

        let zhuType = this._playback.zhuType;
        this._algorithm.zhuType = zhuType;
        this.callinfo.getComponent('poker_sbf_callinfo').checkZhuType(zhuType);

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
                scr_p.resetHolds([].concat(holds));
            }
        });

        let banker = this._playback.banker;
        if (banker > 0) {
            this.broadcastBanker({uid: banker});
        }

        this.eventlist = {};
        this.eventlist['discard'] = this.discard;           /** 出牌*/
        this.eventlist['getScore'] = this.getScore;         /** 得分*/
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

        console.log('playRecored this._step = ', this._step);
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
     * @param {*} data 
     */
    discard (data) {
        if (!data) {
            return;
        }

        let cardsData = data.cardsData;
        let uid = cardsData.uid;
        if (!!data.tableScore) {
            this._tableScore = data.tableScore;
            this.tableScoreNode.getComponent(cc.Label).string = this._tableScore+'A';
        }

        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.discard(cardsData);
        }
    },

    /**
     * 得分
     * @param {*} data 
     */
    getScore (data) {
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

        let starts = [];
        this.players.forEach(el=> {
            starts = starts.concat(this.playerScript(el).getOutScoreCardsPos());
        });
        this.aniNode.getComponent('poker_ani').getScore(starts, end);
        this.tableScoreNode.getComponent(cc.Label).string = '';
        this.players.forEach(el=> {
            this.playerScript(el).clearOutsNode();
        });
    },
});
