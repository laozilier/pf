/**
 * Created by sam on 2020/6/3.
 *
 */

const Player = require('./Player');
const Zp = require('../Zp');
const Status = require('./const').status;
const Event = require('./event');
const Conf = require('./config');
const Algorithm = require('./algorithm');
const enum_chz = require('./enum');
const ActionType = enum_chz.actionType;
const InPokerType = enum_chz.inPokerType;
const HuType = enum_chz.huType;
const Shuffle = require('../../common/shuffle');

class Main extends require('../../BaseMain') {
    constructor(uids, rule, room) {
        super(room);
        this.uids = uids;               //玩家uid列表
        this.rule = rule;
        this.wang_num = rule.wangNum;
        this.piao_fen = rule.piaofen;
        this.fan_xing = rule.fanxing;

        this._algorithm = new Algorithm();
        this._algorithm.setRule(rule);
        this.ante = rule.ante;          //底分
        this.first_turn = -1;
        this.bandians = {};
        this.lastDiscard = undefined;
        this.bottomCards = [];
        this.actions = [];
        this.guochiInfos = [];
        this.leftCards = [];
        this.drawCardUid = -1;
        this.bandianCards = [];
        this.bandianIdxs = [];

        this.piaofenScores = [];
        for (let i = 0; i <= rule.piaofen; i++) {
            this.piaofenScores.push(i*this.ante*10);
        }

        this.initPlayer(room);
    }

    /***
     * 初始化玩家类
     * @param room
     */
    initPlayer(room) {
        this.uids.forEach((uid, i) => {
            let player =  new Player(this);
            player.uid = uid;
            player.seatId = i;
            player.isTrusteeship = room.player(uid).isTrusteeship;
            this.players.push(player);
        });
    }

    /**
     * 重置数据
     */
    resetData() {
        this.bankerUid = -1;            //庄家
        this.status = -1;               //当前状态
        this.turn = -1;                 //当前活跃玩家
        this.holdsList = [];            //玩家手牌，用于回放
        this.foldsList = [];            //打出的牌，用于回放
    }

    /***
     * 游戏开始
     */
    begin() {
        this.log('game begin.............');
        this.resetData();
        this.sendAll(Event.gameBegin, {uids: this.uids});
        this.players.forEach((player) => {
            player.resetData();
            /** 推送托管状态 */
            this.sendAll(Event.tuoGuang, [player.uid, player.isTrusteeship]);
        });

        let lastBanker = this.getLasting().lastBanker;
        if (lastBanker > 0 && this.uids.indexOf(lastBanker) > -1) {
            this.broadcastBanker({uid: lastBanker});
        } else {
            /** 搬点 */
            this.changeStatus(Status.BANDIAN);
            this.turn = 0;
            this.nextBandian(true);
            // this.broadcastBanker({uid: this.uids[0]});
        }
    }

    /**
     * 玩家搬点
     * @param p
     */
    bandian(p, idx) {
        if (this.status !== Status.BANDIAN) {
            this.log(`搬点状态错误 status: ${this.status}`);
            return;
        }

        if (this.uids[this.turn] !== p.uid) {
            this.log(`搬点轮转错误 turnUid: ${this.uids[this.turn]} uid : ${p.uid}`);
            return;
        }

        if (!!this.bandians[p.uid]) {
            this.log(`已经搬点 uid : ${p.uid}`);
            return;
        }

        if (this.bandianCards.length == 0) {
            let cards = [];
            for (let i = 1; i < 21; i++) {
                cards.push(i);
            }
            if (this.wang_num > 0) {
                cards.push(21);
            }

            Shuffle.knuthDurstenfeldShuffle(cards);
            this.bandianCards = cards;
        }

        this.bandianIdxs.push(idx);
        let v = this.bandianCards[idx];
        this.bandians[p.uid] = {idx: idx, v: v};
        this.sendAll(Event.bandian, {uid: p.uid, idx: idx, v: v});
        this.nextBandian();
    }

    broadcastBanker(data) {
        let uid = data.uid;
        let idx = data.idx;
        this.bankerUid = uid;
        this.sendAll(Event.broadcastBanker, {uid: uid, idx: idx});
        if (this.piao_fen > 0) {
            /** 飘分 */
            this.setTimeout(()=> {
                this.sendAll(Event.askPiaofen, this.piaofenScores);
                this.changeStatus(Status.PIAOFEN);
            });
        } else {
            /** 发牌 */
            this.setTimeout(()=> {
                this.deal();
            });
        }
    }

    /**
     * 飘分
     * @param player
     * @param data
     */
    piaofen(player, data) {
        if (this.status !== Status.PIAOFEN) {
            this.log(`飘分状态错误 status: ${this.status}`);
            return false;
        }

        let idx = parseInt(data);
        if (typeof idx != 'number' || idx < 0 || idx >= this.piaofenScores.length) {
            this.log(`飘分数据错误 data: ${data}`);
            return false;
        }

        player.piaofenScore = this.piaofenScores[idx];
        this.sendAll(Event.piaofen, {uid: player.uid, piaofenScore: player.piaofenScore});
        let next = true;
        /** 所有人都飘了分 */
        this.players.forEach(el=> {
            if (el != player && !el.alreadyPiao) {
                next = false;
            }
        });

        if (next) {
            this.deal();
        }

        return true;
    }

    /***
     * 发送牌到客户端
     */
    deal() {
        this.log('deal.............');
        this.changeStatus(Status.SENDHOLDS);
        let cards = Zp.deal(this.wang_num);//
        // cards = [
        //     7, 20, 9, 5, 4, 2, 14, 16, 1, 11, 21, 3, 2, 3, 6, 5, 17, 13, 20, 7, 4,
        //     3, 1, 19, 4, 14, 5, 7, 10, 12, 15, 21, 19, 6, 16, 16, 10, 3, 18, 14, 12,
        //     13, 7, 4, 9, 15, 2, 18, 18, 12, 13, 8, 17, 14, 8, 20, 15, 11, 19, 10, 8,
        //     21, 18, 12, 5, 11, 1, 1, 2, 9, 20,
        //     6, 21, 8, 19, 9, 15, 13, 17, 16, 17, 6, 11, 10
        // ];
        for (let i = 0; i < 3; ++i) {
            if (i < this.players.length) {
                let player = this.players[i];
                let holds = [];
                if (player.uid == this.bankerUid) {
                    holds = cards.splice(0, 21);
                } else {
                    holds = cards.splice(0, 20);
                }
                player.holds = [].concat(holds);
                player.beginHolds = [].concat(holds);
                player.send(Event.holds, holds);
                this.log(`deal seatId = ${player.seatId}, uid = ${player.uid}, beginHolds = ${player.beginHolds}`);
            } else {
                this.leftCards = cards.splice(0, 20);
            }
        }

        /** 保存底牌 */
        this.bottomCards = [].concat(cards);
        this.log(`deal bottomCards = ${this.bottomCards}`);
        let msg = {len: this.bottomCards.length};
        this.sendAll(Event.bottomCards, msg);
        this.foldsList.push({event: Event.bottomCards, msg: JSON.stringify(msg)});
        this.setTimeout(()=> {
            /** 庄家最后一张牌 */
            let bankP = this.player(this.bankerUid);
            let holds = [].concat(bankP.holds);
            let bankLastcard = holds.pop();
            this.sendAll(Event.bankLastcard, bankLastcard);
            this.foldsList.push({event: Event.bankLastcard, msg: bankLastcard});
            this.dealNextCheck(bankP, holds, bankLastcard);
        });
    }

    dealNextCheck(bankP, holds, bankLastcard) {
        this.changeStatus(Status.DRAWCARDWAIT);
        this.turn = this.uids.indexOf(this.bankerUid);
        this.sendNextTurnMsg();
        /** 先检查庄家王炸 王闯 王吊*/
        this.setXingInfo(bankLastcard);
        let wangzha = this._algorithm.checkWangZha(holds, [], bankLastcard, this.xingCard, this.xing);
        if (wangzha) {
            this.actions.push({uid: bankP.uid, auto: false, data: wangzha, t: ActionType.wangzha, v: bankLastcard});
        }

        let wangchuang = this._algorithm.checkWangChuang(holds, [], bankLastcard, this.xingCard, this.xing);
        if (wangchuang) {
            this.actions.push({uid: bankP.uid, auto: false, data: wangchuang, t: ActionType.wangchuang, v: bankLastcard});
        }

        let wangdiao = this._algorithm.checkWangDiao(holds, [], bankLastcard, this.xingCard, this.xing);
        if (wangdiao) {
            this.actions.push({uid: bankP.uid, auto: false, data: wangdiao, t: ActionType.wangdiao, v: bankLastcard});
        }

        /** 再检查胡 如果可以则先发送操作 */
        let hu = this._algorithm.checkHu(holds, [], bankLastcard, this.xingCard, this.xing, 15, HuType.zimo);
        if (!!hu) {
            this.actions.push({uid: bankP.uid, auto: false, data: hu, t: ActionType.hu, v: bankLastcard});
        }

        if (this.actions.length > 0) {
            this.nextStatus = Status.DISCARD;
            this.sendActions();
            return;
        }

        /** 否则进入出牌状态 */
        this.setTimeout(()=> {
            this.nextDiscard();
        });
    }

    /***
     * 下一个玩家
     */
    nextTurn(seat) {
        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        /** 轮转 */
        if (seat == undefined || seat == null || seat < 0) {
            if (this.turn < 0) {
                this.turn = Math.randomRange(0, this.uids.length);
            } else {
                this.turn = (this.turn + 1) % this.uids.length;
            }
        } else {
            this.turn = seat;
        }
    }

    nextBandian(noNeedTurn) {
        if (!!noNeedTurn) {} else {
            this.nextTurn();
        }

        if (this.turn == this.first_turn) {
            let maxv = -1;
            let maxUid;
            for (let uid in this.bandians) {
                let obj = this.bandians[uid];
                if (obj.v == 21) {
                    maxUid = uid;
                    break;
                }

                if (maxv < 0) {
                    maxv = obj.v;
                    maxUid = uid;
                } else {
                    if ((maxv-1)%10 < (obj.v-1)%10) {
                        maxv = obj.v;
                        maxUid = uid;
                    } else if ((maxv-1)%10 == (obj.v-1)%10 && maxv < obj.v) {
                        maxv = obj.v;
                        maxUid = uid;
                    }
                }
            }

            let obj = this.bandians[maxUid];
            let uid = parseInt(maxUid);
            this.setTimeout(()=> {
                this.broadcastBanker({uid: uid, idx: obj.idx});
            });
            return;
        }

        if (this.first_turn == -1) {
            this.first_turn = this.turn;
        }

        let turnPlayer = this.players[this.turn];
        this.startTimeout(turnPlayer);
        this.sendNextTurnMsg();
    }

    nextDiscard() {
        this.changeStatus(Status.DISCARD);
        this.sendNextTurnMsg();
        let turnPlayer = this.players[this.turn];
        /** 玩家死手 下个玩家摸牌 */
        if (turnPlayer.sishou) {
            this.setTimeout(()=> {
                this.nextDrawCard();
            });
        } else {
            /** 如果没有可以出的牌 则玩家死手 */
            if (this._algorithm.hasCanOut(turnPlayer.holds)) {
                /** 计时自动出牌 */
                this.startTimeout(turnPlayer);
            } else {
                /** 玩家死手 下个玩家摸牌 */
                turnPlayer.sishou = true;
                this.sendAll(Event.sishou, turnPlayer.uid);
                this.foldsList.push({event: Event.sishou, msg: turnPlayer.uid});
                this.setTimeout(()=> {
                    this.nextDrawCard();
                });
            }
        }
    }

    nextDrawCard(notNeedCheck, noNeedTurn) {
        this.changeStatus(Status.DRAWCARD);
        if (!!noNeedTurn) {} else {
            this.nextTurn();
        }

        this.sendNextTurnMsg();
        let turnPlayer = this.players[this.turn];
        if (!!this.lastDiscard) {
            /** 将上一张牌加入玩家出牌 */
            this.player(this.lastDiscard.uid).outs.push({v: this.lastDiscard.v, d: this.lastDiscard.d});
            this.sendAll(Event.qiPai, this.lastDiscard);
            this.foldsList.push({event: Event.qiPai, msg: JSON.stringify(this.lastDiscard)});
            /** 这里加入玩家吃牌过张 */
            this.guochiInfos.forEach(el => {
                el.p.guochis.push(el.v);
            });

            this.guochiInfos.length = 0;
            this.lastDiscard = undefined;
        }

        if (this.bottomCards.length <= 0) {
            /** 黄庄 */
            this.gameLiuju();
            return;
        }

        /** 如果不需要检查 */
        if (!!notNeedCheck || turnPlayer.sishou) {} else {
            /** 先检查玩家王炸 王闯 王吊*/
            let wangzha = this._algorithm.checkWangZha(turnPlayer.holds, turnPlayer.inPokers);
            if (wangzha) {
                this.actions.push({uid: turnPlayer.uid, auto: false, data: wangzha, t: ActionType.wangzha});
            } else {
                let wangchuang = this._algorithm.checkWangChuang(turnPlayer.holds, turnPlayer.inPokers);
                if (wangchuang) {
                    this.actions.push({uid: turnPlayer.uid, auto: false, data: wangchuang, t: ActionType.wangchuang});
                } else {
                    let wangdiao = this._algorithm.checkWangDiao(turnPlayer.holds, turnPlayer.inPokers);
                    if (wangdiao) {
                        this.actions.push({uid: turnPlayer.uid, auto: false, data: wangdiao, t: ActionType.wangdiao});
                    }
                }
            }

            /** 如果可以 则先发送操作 */
            if (this.actions.length > 0) {
                this.nextStatus = Status.DRAWCARD;
                this.changeStatus(Status.DRAWCARDWAIT);
                this.sendActions();
                return;
            }
        }

        /** 否则玩家自动摸牌 */
        this.drawCard(turnPlayer);
    }

    sendNextTurnMsg() {
        let uid = this.uids[this.turn];
        let msg = {
            turn: uid,
        };

        this.log(`nextTurn msg = ${JSON.stringify(msg)}`);
        this.sendAll(Event.turn, {turn: uid});
    }

    /**
     * 出牌
     * @param turnPlayer
     * @param card
     */
    discard(turnPlayer, card) {
        if (this.status != Status.DISCARD) {
            this.send(turnPlayer.uid, Event.discardErr, '当前不是出牌状态');
            return;
        }

        if (this.turn !== turnPlayer.seatId) {
            this.send(turnPlayer.uid, Event.discardErr, '当前不是你出牌');
            return;
        }

        let can = this._algorithm.checkCanOut(turnPlayer.holds, card);
        this.log(`出牌 player: ${turnPlayer.uid} card = ${card}`);
        if (!can) {
            this.send(turnPlayer.uid, Event.discardErr, '不可以出这一张牌');
            return;
        }

        this.changeStatus(Status.DISCARDWAIT);
        this.lastDiscard = {uid: turnPlayer.uid, v: card, d: false};
        this.sendAll(Event.discard, this.lastDiscard);
        this.foldsList.push({event: Event.discard, msg: JSON.stringify(this.lastDiscard)});
        turnPlayer.removeHolds([card]);
        turnPlayer.guochis.push(card);

        /** 检查开交 */
        let isJiao = false;
        /** 循环找开交 */
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            let jiao = this._algorithm.checkJiao(p.holds, p.inPokers, card, true);
            if (!!jiao) {
                jiao.dis = true;
                this.actions.push({uid: p.uid, auto: true, data: jiao, v: card});
                isJiao = true;
                break;
            }
        }

        /** 如果开交了 那么下面都不用找了 因为不胡必然开交 吃碰都没有意义 */
        if (isJiao) {
            this.setTimeout(() => {
                this.sendActions();
            });
            return;
        }

        /** 检查碰 */
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            this.log(`discard uid = ${p.uid} guopengs = ${p.guopengs}`);
            if (p.guopengs.includes(card)) {
                break;
            }

            let peng = this._algorithm.checkPeng(p.holds, card);
            if (!!peng) {
                peng.dis = true;
                this.actions.push({uid: p.uid, auto: false, data: peng, t: ActionType.peng, v: card});
                break;
            }
        }

        /** 找吃 只找下家 */
        let nextp = this.getNextPlayer(turnPlayer);
        this.log(`discard uid = ${nextp.uid} guochis = ${nextp.guochis}`);
        if (!nextp.guochis.includes(card)) {
            let chi = this._algorithm.checkChi(nextp.holds, card);
            if (chi) {
                chi.dis = true;
                this.actions.push({uid: nextp.uid, auto: false, data: chi, v: card, t: ActionType.chi});
            }
        }

        if (this.actions.length > 0) {
            /** 所有找完 有操作则发送操作 */
            this.nextStatus = Status.DRAWCARD;
            this.sendActions();
        } else {
            /** 没人要 则下家摸牌 */
            this.setTimeout(()=> {
                this.nextDrawCard();
            });
        }
    }

    /**
     * 摸牌
     * @param turnPlayer
     */
    drawCard(turnPlayer) {
        if (this.bottomCards.length > 0) {
            this.drawCardUid = turnPlayer.uid;
            let card = this.bottomCards.shift();
            this.setXingInfo(card);
            this.log(`drawCard uid = ${turnPlayer.uid} v = ${card}`);
            let msg = {len: this.bottomCards.length};
            this.sendAll(Event.bottomCards, msg);
            this.foldsList.push({event: Event.bottomCards, msg: JSON.stringify(msg)});
            this.changeStatus(Status.DRAWCARDWAIT);
            /** 先检查摸牌玩家的 倾 啸 */
            let qing = this._algorithm.checkQing(turnPlayer.holds, turnPlayer.inPokers, card);
            if (!!qing) {
                let msg = {uid: turnPlayer.uid, v: card, d: true};
                turnPlayer.send(Event.drawCard, msg);
                turnPlayer.sendAll(Event.drawCard, {uid: turnPlayer.uid, v: -1, d: true}, true);
                this.foldsList.push({event: Event.drawCard, msg: JSON.stringify(msg)});
                this.setTimeout(()=> {
                    let msg = {uid: turnPlayer.uid, data: qing};
                    turnPlayer.send(Event.inPoker, msg);
                    turnPlayer.sendAll(Event.inPoker, {
                        uid: turnPlayer.uid,
                        data: {t: qing.t, x: qing.x, v: -1, vs: [-1,-1,-1,-1], c: qing.c, hu: 0}
                    }, true);
                    this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});

                    if (!!qing.c || turnPlayer.sishou) {
                        /** 如果是重交 或者死手了 直接下一个玩家摸牌 */
                        this.setTimeout(()=> {
                            this.nextDrawCard();
                        });
                    } else {
                        qing.end = 1;
                        /** 否则检查胡牌 */
                        let hu = this._algorithm.checkHu(turnPlayer.holds, turnPlayer.inPokers, null, this.xingCard, this.xing, 15, HuType.zimo);
                        if (!!hu) {
                            hu.huCard = card;
                            this.nextStatus = Status.DISCARD;
                            /** 如果可以胡 则发送操作 */
                            this.actions.push({uid: turnPlayer.uid, auto: false, data: hu, v: card, t: ActionType.hu});
                            this.sendActions();
                            return;
                        } else {
                            delete qing.end;
                        }

                        /** 否则自己出牌 */
                        this.nextDiscard();
                    }
                });
                return;
            }

            let xiao = this._algorithm.checkXiao(turnPlayer.holds, card);
            if (!!xiao) {
                let g = turnPlayer.guopengs.includes(card);
                xiao.g = g;
                let msg = {uid: turnPlayer.uid, v: card, d: true};
                if (g) {
                    turnPlayer.sendAll(Event.drawCard, msg);
                } else {
                    turnPlayer.send(Event.drawCard, msg);
                    turnPlayer.sendAll(Event.drawCard, {uid: turnPlayer.uid, v: -1, d: true}, true);
                }
                this.foldsList.push({event: Event.drawCard, msg: JSON.stringify(msg)});
                this.setTimeout(()=> {
                    turnPlayer.inPokers.push(xiao);
                    let msg = {uid: turnPlayer.uid, data: xiao};
                    if (g) {
                        turnPlayer.sendAll(Event.inPoker, msg);
                    } else {
                        turnPlayer.send(Event.inPoker, msg);
                        turnPlayer.sendAll(Event.inPoker, {
                            uid: turnPlayer.uid,
                            data: {t: xiao.t, v: -1, vs: [-1,-1,-1], g:false, hu:0}
                        }, true);
                    }
                    this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});

                    xiao.end = 1;
                    /** 检查胡牌 */
                    let hu = this._algorithm.checkHu(turnPlayer.holds, turnPlayer.inPokers, null, this.xingCard, this.xing, 15, HuType.zimo);
                    if (!!hu) {
                        hu.huCard = card;
                        this.nextStatus = Status.DISCARD;
                        /** 如果可以胡 则发送操作 */
                        this.actions.push({uid: turnPlayer.uid, auto: false, data: hu, v: card, t: ActionType.hu});
                        this.sendActions();
                        return;
                    } else {
                        delete xiao.end;
                    }

                    /** 否则自己出牌 */
                    this.nextDiscard();
                });

                return;
            }

            /** 向所有人发送摸到的牌 */
            this.lastDiscard = {uid: turnPlayer.uid, v: card, d: true};
            this.sendAll(Event.drawCard, this.lastDiscard);
            this.foldsList.push({event: Event.drawCard, msg: JSON.stringify(this.lastDiscard)});
            /** 检查自己的王炸 王闯 王吊 胡牌 如果死守了则跳过 */
            if (!turnPlayer.sishou) {
                let wangzha = this._algorithm.checkWangZha(turnPlayer.holds, turnPlayer.inPokers, card, this.xingCard, this.xing);
                if (!!wangzha) {
                    this.actions.push({uid: turnPlayer.uid, auto: false, data: wangzha, t: ActionType.wangzha, v: card});
                } else {
                    let wangchuang = this._algorithm.checkWangChuang(turnPlayer.holds, turnPlayer.inPokers, card, this.xingCard, this.xing);
                    if (!!wangchuang) {
                        this.actions.push({uid: turnPlayer.uid, auto: false, data: wangchuang, t: ActionType.wangchuang, v: card});
                    } else {
                        let wangdiao = this._algorithm.checkWangDiao(turnPlayer.holds, turnPlayer.inPokers, card, this.xingCard, this.xing);
                        if (!!wangdiao) {
                            this.actions.push({uid: turnPlayer.uid, auto: false, data: wangdiao, t: ActionType.wangdiao, v: card});
                        } else {
                            let hu = this._algorithm.checkHu(turnPlayer.holds, turnPlayer.inPokers, card, this.xingCard, this.xing, 15, HuType.zimo);
                            if (!!hu) {
                                this.actions.push({uid: turnPlayer.uid, auto: false, data: hu, t: ActionType.hu, v: card});
                            }
                        }
                    }
                }
            }

            /** 如果摸到赖子 */
            if (card > 20) {
                /** 如果有操作 */
                if (this.actions.length > 0) {
                    this.nextStatus = Status.DISCARD;
                    this.sendActions();
                    return;
                }

                /** 翻入手牌 然后轮到玩家出牌 */
                this.setTimeout(()=> {
                    turnPlayer.holds.push(card);
                    this.lastDiscard = undefined;
                    let msg = {uid: turnPlayer.uid, v: 21};
                    this.sendAll(Event.addHolds, msg);
                    this.foldsList.push({event: Event.addHolds, msg: JSON.stringify(msg)});
                    this.nextDiscard();
                });
                return;
            }

            /** 循环检查其他人胡牌 有王必须自摸 死手玩家跳过 */
            let nextp = this.getNextPlayer(turnPlayer);
            do {
                if (!nextp.sishou && !nextp.holds.includes(21)) {
                    let hu = this._algorithm.checkHu(nextp.holds, nextp.inPokers, card, this.xingCard, this.xing, 15, HuType.dianpao);
                    if (!!hu) {
                        this.actions.push({uid: nextp.uid, auto: false, data: hu, t: ActionType.hu, v: card});
                    }
                }

                nextp = this.getNextPlayer(nextp);
            } while (nextp.uid != turnPlayer.uid);

            let isJiao = false;
            /** 循环找开交 */
            for (let i = 0; i < this.players.length; i++) {
                let p = this.players[i];
                let jiao = this._algorithm.checkJiao(p.holds, p.inPokers, card);
                if (!!jiao) {
                    this.actions.push({uid: p.uid, auto: true, data: jiao, v: card});
                    isJiao = true;
                    break;
                }
            }

            /** 如果开交了 那么下面都不用找了 因为不胡必然开交 吃碰都没有意义 */
            if (isJiao) {
                if (this.actions.length > 1) {
                    this.sendActions();
                } else {
                    this.setTimeout(()=> {
                        this.sendActions();
                    });
                }
                return;
            }
            /** 循环找碰 */
            for (let i = 0; i < this.players.length; i++) {
                let p = this.players[i];
                if (p.guopengs.includes(card)) {
                    break;
                }
                if (p.sishou) {
                    continue;
                }

                let peng = this._algorithm.checkPeng(p.holds, card);
                if (!!peng) {
                    this.actions.push({uid: p.uid, auto: false, data: peng, t: ActionType.peng, v: card});
                    break;
                }
            }

            /** 找吃 只有自家和下家 */
            if (!turnPlayer.guochis.includes(card)) {
                let chi = this._algorithm.checkChi(turnPlayer.holds, card);
                if (chi) {
                    this.actions.push({uid: turnPlayer.uid, auto: false, data: chi, v: card, t: ActionType.chi});
                }
            }

            nextp = this.getNextPlayer(turnPlayer);
            if (!nextp.guochis.includes(card)) {
                let chi = this._algorithm.checkChi(nextp.holds, card);
                if (chi) {
                    this.actions.push({uid: nextp.uid, auto: false, data: chi, v: card, t: ActionType.chi});
                }
            }
            /** 所有找完 发送操作 */
            if (this.actions.length > 0) {
                this.nextStatus = Status.DRAWCARD;
                this.sendActions();
            } else {
                /** 下家摸牌 */
                this.setTimeout(()=> {
                    this.nextDrawCard();
                });
            }
        } else {
            /** 黄庄 */
            this.gameLiuju();
        }
    }

    /**
     * 发送操作
     */
    sendActions() {
        if (this.actions.length == 0) {
            return;
        }

        let objs = {};
        for (let i = 0; i < this.actions.length; i++) {
            let action = this.actions[i];
            let auto = action.auto;
            if (!!auto) {
                continue;
            }

            let uid = action.uid;
            let obj = {t: action.t, v: action.v};
            if (action.t == ActionType.chi) {
                obj.data = action.data;
            }

            if (!!objs[uid]) {
                objs[uid].push(obj);
            } else {
                objs[uid] = [obj];
            }
        }

        this.setTimeout(()=> {
            for (let uid in objs) {
                this.log(`发送操作 uid = ${uid} actions = ${JSON.stringify(objs[uid])}`);
                this.send(parseInt(uid), Event.action, objs[uid]);
                this.player(uid).startTimeout();
            }

            this.nextDoAction();
        });
    }

    /**
     * 玩家操作
     * @param p
     * @param data
     */
    playerDoAction(p, data) {
        this.log(`playerDoAction uid = ${p.uid} data = ${JSON.stringify(data)}`);
        if (this.actions.length == 0) {
            return;
        }

        let uid = p.uid;
        let t = data.t;
        if (t == null || t == undefined || isNaN(t)) {
            this.send(uid, Event.toast, '参数错误');
            return;
        }

        this.send(uid, Event.hideAction, {});
        if (t == ActionType.pass) {
            this.playerGiveup(p);
        } else {
            let can = false;
            for (let i = 0; i < this.actions.length; i++) {
                let action = this.actions[i];
                if (action.uid == uid) {
                    if (action.t == t) {
                        if (action.t == ActionType.chi) {
                            action.acts = data.acts;
                            let actionData = action.data;
                            let tempData = JSON.parse(JSON.stringify(actionData));
                            let obj = undefined;
                            for (let j = 0; j < action.acts.length; j++) {
                                let act = action.acts[j];
                                if (act > -1 && act < tempData.length) {
                                    obj = tempData[act];
                                    tempData = obj.xhs;
                                }
                            }

                            if (obj == undefined) {
                                this.send(uid, Event.toast, '不能吃牌');
                                return;
                            }
                        }

                        can = true;
                        action.auto = true;
                    } else {
                        this.actions.splice(i, 1);
                        i-=1;
                    }
                }
            }

            if (!can) {
                this.send(uid, Event.toast, '不能重复操作');
                return;
            }

            this.nextDoAction();
        }
    }

    playerGiveup(p) {
        if (this.actions.length == 0) {
            return;
        }

        for (let i = 0; i < this.actions.length; i++) {
            let action = this.actions[i];
            if (action.uid == p.uid && !action.auto) {
                /** 如果是吃 则需要等到这张牌变成弃牌后才是过张 */
                if (action.t == ActionType.chi) {
                    this.guochiInfos.push({p:p, v: action.v, g: this.lastDiscard.uid == p.uid});
                }

                /** 如果是碰 则直接加入过张 */
                if (action.t == ActionType.peng) {
                    p.guopengs.push(action.v);
                }

                this.actions.splice(i, 1);
                i-=1;
            }
        }

        this.nextDoAction();
    }

    /**
     * 执行操作
     */
    nextDoAction() {
        if (this.actions.length == 0) {
            /** 所有人都放弃了 */
            if (this.nextStatus == Status.DRAWCARD) {
                if (!!this.lastDiscard) {
                    this.nextDrawCard();
                } else {
                    this.nextDrawCard(true, true);
                }
            } else {
                if (!!this.lastDiscard && this.lastDiscard.v == 21) {
                    let uid = this.lastDiscard.uid;
                    let p = this.player(uid);
                    p.holds.push(this.lastDiscard.v);
                    let msg = {uid: uid, v: 21};
                    this.sendAll(Event.addHolds, msg);
                    this.foldsList.push({event: Event.addHolds, msg: JSON.stringify(msg)});
                    this.lastDiscard = undefined;
                }

                this.nextDiscard();
            }
            return;
        }

        /** 看顺位第一的是否是自动的 */
        let first = this.actions[0];
        if (!!first.auto) {
            this.actions.length = 0;
            if (first.t == ActionType.wangzha || first.t == ActionType.wangchuang || first.t == ActionType.wangdiao) {
                this.changeStatus(Status.SETTLE);
                if (!!this.lastDiscard) {
                    this.actionHu = {uid: first.uid, huType: first.data.huType, v: this.lastDiscard.v};
                    this.sendAll(Event.actionHu, this.actionHu);
                    this.foldsList.push({event: Event.actionHu, msg: JSON.stringify(this.actionHu)});
                    this.setTimeout(()=> {
                        /** 胡牌结束 */
                        this.gameOver(first);
                    });
                } else {
                    /** 先胡牌动作 */
                    this.actionHu = {uid: first.uid, huType: first.data.huType};
                    this.sendAll(Event.actionHu, this.actionHu);
                    this.foldsList.push({event: Event.actionHu, msg: JSON.stringify(this.actionHu)});

                    /** 翻一张牌 */
                    this.setTimeout(()=> {
                        /** 翻一张牌 */
                        let card = this.bottomCards.splice(0, 1)[0];
                        this.setXingInfo(card);
                        this.log(`drawCard uid = ${first.uid} v = ${card}`);
                        let msg = {len: this.bottomCards.length};
                        this.sendAll(Event.bottomCards, msg);
                        this.foldsList.push({event: Event.bottomCards, msg: JSON.stringify(msg)});
                        /** 向所有人发送摸到的牌 */
                        this.lastDiscard = {uid: first.uid, v: card, d: true, hu: true};
                        this.sendAll(Event.drawCard, this.lastDiscard);
                        this.foldsList.push({event: Event.drawCard, msg: JSON.stringify(this.lastDiscard)});
                        let p = this.player(first.uid);
                        if (first.t == ActionType.wangzha) {
                            first.data = this._algorithm.checkWangZha(p.holds, p.inPokers, card, this.xingCard, this.xing);
                        } else if (first.t == ActionType.wangchuang) {
                            first.data = this._algorithm.checkWangChuang(p.holds, p.inPokers, card, this.xingCard, this.xing);
                        } else {
                            first.data = this._algorithm.checkWangDiao(p.holds, p.inPokers, card, this.xingCard, this.xing);
                        }
                        first.data.huCard = card;
                    });

                    this.setTimeout(()=> {
                        /** 再胡牌结束 */
                        this.gameOver(first);
                    }, 2000);
                }
            } else if (first.t == ActionType.hu) {
                this.changeStatus(Status.SETTLE);
                this.actionHu = {uid: first.uid, huType: first.data.huType, v: first.data.huCard};
                this.sendAll(Event.actionHu, this.actionHu);
                this.foldsList.push({event: Event.actionHu, msg: JSON.stringify(this.actionHu)});
                this.setTimeout(()=> {
                    /** 胡牌结束 */
                    this.gameOver(first);
                });
            } else {
                this.lastDiscard = undefined;
                /** 吃 */
                if (first.t == ActionType.chi) {
                    this.guochiInfos.forEach(el => {
                        if (!!el.g) {
                            el.p.guochis.push(el.v);
                        }
                    });

                    /** 移除手牌里的吃牌 */
                    let p = this.player(first.uid);
                    let acts = first.acts;
                    let tempData = JSON.parse(JSON.stringify(first.data));
                    let delay = 0;
                    for (let i = 0; i < acts.length; i++) {
                        let act = acts[i];
                        if (act > -1) {
                            let obj = tempData[act];
                            tempData = JSON.parse(JSON.stringify(obj.xhs));
                            p.removeHolds(obj.vs);
                            delete obj.xhs;
                            p.inPokers.push(obj);
                            this.setTimeout(()=> {
                                let msg = {uid: first.uid, data: obj};
                                this.sendAll(Event.inPoker, msg);
                                this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});
                            }, delay);
                            delay+=1000;
                        } else {
                            this.setTimeout(()=> {
                                this.turn = this.uids.indexOf(first.uid);
                                this.nextDiscard();
                            }, delay);
                            break;
                        }
                    }
                }
                /** 碰 */
                else if (first.t == ActionType.peng) {
                    let msg = {uid: first.uid, data: first.data};
                    this.sendAll(Event.inPoker, msg);
                    this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});
                    /** 移除手牌里的两张 */
                    let p = this.player(first.uid);
                    p.removeHolds([first.v, first.v]);
                    p.inPokers.push(first.data);
                    this.turn = this.uids.indexOf(first.uid);
                    this.nextDiscard();
                }
                /** 开交 */
                else {
                    /** 如果是开交 则判断是不是重交 如果是重交 则下家摸牌 */
                    if (first.data.t == InPokerType.jiao) {
                        let msg = {uid: first.uid, data: first.data};
                        this.sendAll(Event.inPoker, msg);
                        this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});
                        let p = this.player(first.uid);
                        /** 如果不是啸和碰转交 则要移除手牌里面的3张牌 */
                        if (first.data.idx != undefined) {
                            p.inPokers.splice(first.data.idx, 1, first.data);
                        } else {
                            p.removeHolds([first.v, first.v, first.v]);
                            p.inPokers.push(first.data);
                        }

                        if (first.data.c) {
                            this.setTimeout(()=> {
                                this.changeStatus(Status.DRAWCARD);
                                let nextp = this.getNextPlayer(p);
                                this.turn = this.uids.indexOf(nextp.uid);
                                this.nextDrawCard(false, true);
                            });
                        } else {
                            this.turn = this.uids.indexOf(p.uid);
                            this.nextDiscard();
                        }
                    }
                }
            }
            this.guochiInfos.length = 0;
        }
    }

    /**
     * 获取下一个位置的玩家
     * @param p
     * @returns {*}
     */
    getNextPlayer(p) {
        let idx = this.uids.indexOf(p.uid);
        idx+=1;
        if (idx >= this.uids.length) {
            idx = 0;
        }

        return this.players[idx];
    }

    /**
     * 设置醒的相关信息
     * @param card
     */
    setXingInfo(card) {
        let xingCard = card;
        let xing = card;
        if (this.fan_xing == 3) {} else {
            if (this.bottomCards.length > 0) {
                xingCard = this.bottomCards[0];
                xing = xingCard;
            }

            if (xingCard != 21) {
                /** 下醒 */
                if (this.fan_xing == 0) {
                    xing = xing+1;
                    if (xing == 21) {
                        xing = 1;
                    }
                }
                /** 上醒 */
                else if (this.fan_xing == 2) {
                    xing = xing-1;
                    if (xing == 0) {
                        xing = 20;
                    }
                }
            }
        }

        this.xingCard = xingCard;
        this.xing = xing;
    }

    /**
     * 游戏结束
     */
    gameOver(action) {
        if (this._gameEnd) {
            return;
        }

        this._gameEnd = true;
        this.changeStatus(Status.SETTLE);
        this.xingInfo = {xingCard: this.xingCard, xing: this.xing, t: this.fan_xing};
        this.sendAll(Event.fanxing, this.xingInfo);
        this.foldsList.push({event: Event.fanxing, msg: JSON.stringify(this.xingInfo)});
        let winPlayer = this.player(action.uid);
        this.getLasting().lastBanker = winPlayer.uid;
        /** 计算输赢分数 */
        this.players.forEach(el => {
            if (el.uid != winPlayer.uid) {
                let score = action.data.total*this.ante;
                el.score -= score;
                el.score -= el.piaofenScore;
                el.score -= winPlayer.piaofenScore;
                winPlayer.score += score;
                winPlayer.score += el.piaofenScore;
                winPlayer.score += winPlayer.piaofenScore;
            }
        });

        this.setTimeout(()=> {
            this.calculateResult(action.data);
        }, 2000);
    }

    async gameLiuju() {
        if (this._gameEnd) {
            return;
        }

        this._gameEnd = true;
        this.changeStatus(Status.SETTLE);
        this.sendAll(Event.liuju);

        /** 谁摸最后一张牌 谁就是下把庄家 */
        this.getLasting().lastBanker = this.drawCardUid;
        /** 计算输赢分数 没有赖子要进钱 每个赖子10倍底注 */
        let noLaiziPlayers = [];
        let laiziPlayers = [];
        this.players.forEach(el => {
            if (!el.holds.includes(21)) {
                noLaiziPlayers.push(el);
            } else {
                laiziPlayers.push(el);
            }
        });

        /** 有赖子和没赖子的都有 */
        if (noLaiziPlayers.length > 0 && laiziPlayers.length > 0) {
            let total = 0;
            laiziPlayers.forEach((el)=> {
                let c = this._algorithm.calcCountInArray(el.holds, 21);
                let score = c*this.ante*10;
                total += score;
                el.score -= score;
            });

            let oneScore = Math.floor(total/noLaiziPlayers.length);
            noLaiziPlayers.forEach((el)=> {
                el.score += oneScore;
            });
        }

        this.setTimeout(()=> {
            this.calculateResult();
        }, 2000);
    }

    /**
     * 计算结果
     */
    async calculateResult(data) {
        /** 上传分数 */
        let actualScores = await this.pushScore();
        let playerPiaofenScores = {};
        let msg = {
            scores: actualScores,
            banker: this.bankerUid,
            bottomCards: this.bottomCards,
            leftCards: this.leftCards,
        };
        if (!!data) {
            msg.data = data;
        }

        this.players.forEach(el=> {
            playerPiaofenScores[el.uid] = el.piaofenScore;
        });

        msg.playerPiaofenScores = playerPiaofenScores;
        this.sendAll(Event.gameResult, msg);
        this.end();
    }

    /**
     * 玩家主动托管
     * @param player
     */
    checkPlayerIsTrusteeship(player) {
        if (player.seatId != this.turn) {
            return;
        }

        /** 开启自动计时器 */
        this.startTimeout(player, player.isTrusteeship);
    }

    startTimeout(turnPlayer, quick) {
        return;
        /** 先清除自动计时器 */
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }

        let actionTime = Conf.actionTime;
        if (!!turnPlayer) {
            if (turnPlayer.isTrusteeship) {
                actionTime = !!quick ? 0 : 1000;
            }
        } else {
            turnPlayer = this.player(this.bankerUid);
        }

        switch (this.status) {
            case Status.BANDIAN:
                this._autoTimeout = this.setTimeout(() => {
                    let idx = Math.randomRange(1, 18);
                    while (this.bandianIdxs.includes(idx)) {
                        idx = Math.randomRange(1, 18);
                    }
                    this.bandian(turnPlayer, idx);
                    this.playerAutoTrusteeship(turnPlayer);
                }, Math.min(actionTime, Conf.bandianTime));
                break;
            case Status.PIAOFEN:
                /** 一定时间自动飘分 */
                this._autoTimeout = this.setTimeout(() => {
                    this.players.forEach(el => {
                        el.piaofen(0);
                        this.playerAutoTrusteeship(el);
                    });
                }, Conf.piaofenTime);

                /** 托管玩家直接飘分 */
                this.setTimeout(() => {
                    this.players.forEach(el => {
                        if (el.isTrusteeship) {
                            el.piaofen(0);
                        }
                    });
                });

                break;
            case Status.DISCARD:
                this._autoTimeout = this.setTimeout(() => {
                    if (turnPlayer.sishou) {
                        this.nextDrawCard();
                    } else {
                        let card = this.autoDiscard(turnPlayer);
                        if (!!card) {
                            this.discard(turnPlayer, card);
                        } else {
                            turnPlayer.sishou = true;
                            this.sendAll(Event.sishou, turnPlayer.uid);
                            this.foldsList.push({event: Event.sishou, msg: turnPlayer.uid});
                            this.setTimeout(()=> {
                                this.nextDrawCard();
                            });

                            this.playerAutoTrusteeship(turnPlayer);
                        }
                    }
                }, actionTime);
                break;
            default:
                break;
        }
    }

    /**
     * 玩家自动托管
     */
    playerAutoTrusteeship(player) {
        if (!player.isTrusteeship) {
            player.isTrusteeship = true;
            this.room.player(player.uid).isTrusteeship = true;
            this.sendAll(Event.tuoGuang, [player.uid, player.isTrusteeship]);
        }
    }

    /***
     * 自动出牌
     * @param turnPlayer
     */
    autoDiscard(turnPlayer) {
        let card = this._algorithm.getAutoDicard(turnPlayer.holds);
        return card;
    }

    /***
     * 桌子状态改变
     * @param code
     */
    changeStatus(code) {
        this.log(`table change status: ${code}`);
        if (!!this._autoTimeout) {
            this.clearTimeout(this._autoTimeout);
            this._autoTimeout = undefined;
        }
        this.status = code;
        this.sendAll(Event.gameStatus, {status: code});
    }

    /**
     * 获取游戏信息
     */
    getInfo(uid) {
        uid = parseInt(uid);
        let msg = {
            uids: this.uids,                        //当前游戏中的玩家
            players: {},
            turn: this.uids[this.turn],
            status: this.status,
            banker: this.bankerUid,
            lastDiscard: this.lastDiscard,
            bottomCards: this.bottomCards.length,
            bandian: this.bandians,
            actionHu: this.actionHu,
            xingInfo: this.xingInfo,
            piaofenScores: this.piaofenScores,
        };

        this.players.forEach(function (el) {
            msg.players[el.uid] = el.getInfos(uid);
        }, this);
        // this.log(msg);
        this.send(uid, Event.gameInfo, msg);
        /** 需要发送操作 */
        this.sendGetInfoActions(uid);
    }

    /**
     * 发送操作
     */
    sendGetInfoActions(puid) {
        if (this.actions.length == 0) {
            return;
        }

        let objs = [];
        for (let i = 0; i < this.actions.length; i++) {
            let action = this.actions[i];
            let auto = action.auto;
            if (!!auto) {
                continue;
            }

            let uid = action.uid;
            if (puid != uid) {
                continue;
            }
            let data = action.data;
            objs.push({t: action.t, data: data});
        }

        if (objs.length > 0) {
            this.send(puid, Event.action, objs);
        }
    }

    /**
     * 回放数据
     */
    getPlayback() {
        let history = {
            uids: this.uids,
            foldsList: this.foldsList,
            banker: this.bankerUid,
            bottomCards: this.bottomCards,
        };

        this.players.forEach((player, index) => {
            history[player.uid] = {
                holds: player.beginHolds,
                piaofenScore: player.piaofenScore
            };
        });

        //this.log(history);
        return history;
    }

    log(info) {
        // console.log(`table[${this.room.rid}] info：`, info);
    }
}

module.exports = Main;