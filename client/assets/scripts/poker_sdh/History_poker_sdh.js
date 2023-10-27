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

        cc.vv.audioMgr.playBGM("poker/public/bgm.mp3");
        let single = this.node.getChildByName('single');

        this.liujuNode = single.getChildByName('liuju');                                           //流局dongz
        this.liujuNode.active = false;

        this.wanjiatoux = single.getChildByName('wanjiatoux'); 
        this.wanjiatoux.active = false;

        this.poNode = single.getChildByName('po'); 
        this.poNode.active = false;

        this.zaipoNode = single.getChildByName('zaipo'); 
        this.zaipoNode.active = false;

        this.aniNode = single.getChildByName('poker_ani');
        this.bottomCardsNode = single.getChildByName('bottomCards');

        this.tableScoreNode = single.getChildByName('tableScore');

        this.callinfo =  single.getChildByName('poker_sdh_callinfo');
        this.getScoreNode = single.getChildByName('poker_getScore');
    },

    //场景重置
    sceneNodesReset() {
        this.aniNode.getComponent('poker_ani').reset();
        this.liujuNode.getComponent(cc.Animation).stop();
        this.liujuNode.active = false;

        this.wanjiatoux.getComponent(cc.Animation).stop();
        this.wanjiatoux.active = false;

        this.poNode.active = false;
        this.zaipoNode.active = false;

        this.callinfo.getComponent('poker_sdh_callinfo').reset();
        this.bottomCardsNode.getComponent('poker_sdh_bottomCards').reset();

        this.resetTableScoreNode();
        this.getScoreNode.getComponent('poker_getScore').reset();
    },

    resetTableScoreNode() {
        this.tableScoreNode.stopAllActions();
        this.tableScoreNode.opacity = 255;
        this.tableScoreNode.y = 60;
        this.tableScoreNode.getComponent(cc.Label).string = '';
    },

    /**
     * 准备开始
     */
     prepareRecord() {
        this._super();

        let zhuType = this._playback.zhuType;
        this._algorithm.zhuType = zhuType;
        this.callinfo.getComponent('poker_sdh_callinfo').checkData(this._playback);

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
        
        this.bottomCards = this._playback.bottomCards;
        if (!!this._playback.isSurrendered) {

        } else {
            this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showMaidiBottomCards(this.bottomCards.length);
        }

        this.eventlist = {};
        this.eventlist['discard'] = this.discard;           /** 出牌*/
        this.eventlist['getScore'] = this.getScore;         /** 得分*/
        // this.playRecored();
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
     * 出牌
     * @param data
     */
    discard(data, disconnect) {
        if (!data) {
            return;
        }

        /** 第一手牌 */
        let cardsData = data.cardsData;
        if (!!cardsData.first) {
            this._algorithm.firstCards = cardsData;
        }

        /** 最大一手牌 */
        if (!!cardsData.max) {
            if (!!this._algorithm.maxCards && this._algorithm.maxCards.uid != cardsData.uid) {
                let p = this.getPlayerByUid(this._algorithm.maxCards.uid);
                if (!!p) {
                    let script = this.playerScript(p);
                    script.hideMaxCard();
                }
            }
            this._algorithm.maxCards = cardsData;
        }

        let uid = cardsData.uid;
        if (uid == cc.dm.user.uid) {
            this.tishiBtn.active = false;
            this.chupaiBtn.active = false;
        }

        if (!!data.tableScore) {
            this.resetTableScoreNode();
            this.tableScoreNode.getComponent(cc.Label).string = data.tableScore+'A';
        }

        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.discard(cardsData, disconnect);
        }
    },

    /**
     * 亮底
     * @param data
     * */
    liangdi(data) {
        this.players.forEach(el=> {
            let scr_p = this.playerScript(el);
            scr_p.gameOver();
        });

        this.bottomCardsNode.getComponent('poker_sdh_bottomCards').showLiangdiBottomCards(data, this._algorithm);
        if (!!data.score) {
            setTimeout(() => {
                this.xianScore(data, true);
            }, 2000);
        }
    },

    /**
     * 广播庄家
     * @param uid
     */
    broadcastBanker(uid) {
        this.bankerUid = uid;
        let p = this.getPlayerByUid(uid);
        if (!!p) {
            let script = this.playerScript(p);
            script.setPlayerBanker(true);
        }

        this.bottomCardsNode.getComponent('poker_sdh_bottomCards').reset();
    },

    /**
     * 投降
     * @param data
     * */
    surrender(data) {
        //投降动画
        this.wanjiatoux.active = true;
        this.wanjiatoux.getComponent(cc.Animation).play();
        let player = this.getPlayerByUid(this.bankerUid);
        if (!!player) {
            let num = Math.floor(Math.random()*2)+1;
            cc.vv.audioMgr.playSFX("poker/sdh/"+ this.playerScript(player)._sex+"/renshu" + num + ".mp3");
        }
    },

    /**
     * 留守
     * @param data
     * */
    liushou(data) {
        if(!!data) {
            let p = this.getPlayerByUid(data.uid);
            if (!!p) {
                //显示玩家留守
                this.playerScript(p).liushou(data.type);
            }

            if(data.uid == cc.dm.user.uid) {
                this.liangzhuNode.getComponent('poker_liangzhu').reset();
            }
        }
    },

    /**
     * 报副
     * @param data
     * */
    baofu(data) {
        if(!!data) {
            let p = this.getPlayerByUid(data);
            if (!!p) {
                //显示玩家报副
                this.playerScript(p).baofu(true);
            }
        }
    },

    /**
     * 闲家得分
     * @param data
     * */
    xianScore(data, isLiangdi) {
        if (!!data && !!data.score) {
            let xianScore = data.score;
            let scoreCards = data.scoreCards;
            let ends = this.getScoreNode.getComponent('poker_getScore').addData(xianScore, scoreCards);
            let starts = [];
            if (isLiangdi) {
                starts = this.bottomCardsNode.getComponent('poker_sdh_bottomCards').getLiangdiScoreCardsPosition(this._algorithm);
            } else {
                this.players.forEach(el=> {
                    starts = starts.concat(this.playerScript(el).getOutScoreCardsPos());
                });
            }
            
            this.aniNode.getComponent('poker_ani').getScore(starts, ends);
            this.resetTableScoreNode();
            this.tableScoreNode.getComponent(cc.Label).string = '+'+xianScore+'A';
            this.tableScoreNode.runAction(cc.sequence(
                cc.delayTime(0.5),
                cc.moveBy(0.5,cc.p(0,50)), 
                cc.fadeTo(0.3, 0)));
            cc.vv.audioMgr.playSFX("poker/public/getScore.mp3");
            if (!!data.isPo) {
                this.poNode.active = true;
                this.poNode.getComponent(cc.Animation).play();
                cc.vv.audioMgr.playSFX("animate/baoza.wav");
                if (data.isXiaoPo) {
                    setTimeout(() => {
                        this.zaipoNode.active = true;
                        this.zaipoNode.getComponent(cc.Animation).play();
                        cc.vv.audioMgr.playSFX("animate/baoza.wav");
                        if (data.isDaPo) {
                            setTimeout(() => {
                                this.zaipoNode.getComponent(cc.Animation).play();
                                cc.vv.audioMgr.playSFX("animate/baoza.wav");
                            }, 1000);
                        }
                    }, 1000);
                }
            } else if (data.isXiaoPo) {
                this.zaipoNode.active = true;
                this.zaipoNode.getComponent(cc.Animation).play();
                cc.vv.audioMgr.playSFX("animate/baoza.wav");
                if (data.isDaPo) {
                    setTimeout(() => {
                        this.zaipoNode.getComponent(cc.Animation).play();
                        cc.vv.audioMgr.playSFX("animate/baoza.wav");
                    }, 1000);
                }
            } else if (data.isDaPo) {
                this.zaipoNode.active = true;
                this.zaipoNode.getComponent(cc.Animation).play();
                cc.vv.audioMgr.playSFX("animate/baoza.wav");
            }
        } else {
            this.tableScoreNode.runAction(cc.fadeTo(0.3, 0));
        }
    },
});

