/**
 * Created by sam on 2020/6/3.
 *
 */

const Player = require('./Player');
const Status = require('./const').status;
const Event = require('./event');
const Conf = require('./config');
const Algorithm = require('./algorithm');
const enum_hz = require('./enum');
const ActionType = enum_hz.actionType;
const InPokerType = enum_hz.inPokerType;
const HuType = enum_hz.huType;
const GangType = enum_hz.gangType;

class Main extends require('../../BaseMain') {
    constructor(uids, rule, room) {
        super(room);
        this.uids = uids;               //玩家uid列表
        this.rule = rule;
        this._algorithm = new Algorithm();
        this._algorithm.setRule(rule);
        this.duo_pao = (!!rule.gameRules && !!rule.gameRules[0]);
        this.zhaniao = rule.zhaniao || 0;

        this.ante = rule.ante;          //底分
        this.first_turn = -1;
        this.lastDiscard = undefined;
        this.bottomCards = [];
        this.actions = [];
        this.leftCards = [];
        this.actionHus = [];
        this.huUids = [];
        this.paoUid = undefined;
        this.huCard = undefined;
        this.gameIsHu = false;
        this.otherHolds = [];
        this.mgData = {}; //碰杠数据 可以被抢杠胡
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
        this.mgData = undefined;
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

        this.setTimeout(()=> {
            let lastBanker = this.getLasting().lastBanker;
            if (lastBanker > 0 && this.uids.indexOf(lastBanker) > -1) {
                this.broadcastBanker({uid: lastBanker});
            } else {
                this.broadcastBanker({uid: this.uids[0]});
            }
        });
    }

    broadcastBanker(data) {
        let uid = data.uid;
        let idx = data.idx;
        this.bankerUid = uid;
        this.sendAll(Event.broadcastBanker, {uid: uid, idx: idx});
        /** 发牌 */
        this.setTimeout(()=> {
            this.deal();
        }, 2000);
    }

    /***
     * 发送牌到客户端
     */
    deal() {
        this.log('deal.............');
        this.changeStatus(Status.SENDHOLDS);
        let cards = this._algorithm.deal(4);
        // cards = [
        //     1,1,1,2,2,2,3,3,3,4,4,7,8,
        //     6,6,7,7,8,8,9,9,11,11,12,12,13,
        //     3, 26, 9, 5, 22, 15, 12, 6, 6, 28, 28, 8, 9,
        //     3, 26, 9, 5, 22, 15, 12, 6, 6, 28, 28, 8, 9,
        //
        //     6, 17, 6, 11, 2, 5, 16, 3, 12, 22, 24,
        //     7, 24, 35, 18, 27, 23, 1, 24, 6, 29, 22, 14, 17, 15, 2, 19, 19, 25, 4, 29, 35, 16, 26, 26
        // ];

        for (let i = 0; i < 4; ++i) {
            if (i < this.players.length) {
                let player = this.players[i];
                let holds = cards.splice(0, 13);
                player.holds = [].concat(holds);
                player.beginHolds = [].concat(holds);
                player.send(Event.holds, holds);
                this.log(`deal seatId = ${player.seatId}, uid = ${player.uid}, beginHolds = ${player.beginHolds}`);
            } else {
                this.leftCards.push(cards.splice(0, 13));
            }
        }


        /** 保存底牌 */
        this.oriBottomCards = cards;
        this.bottomCards = [].concat(cards);

        this.log(`deal bottomCards = ${this.bottomCards}`);


        this.setTimeout(()=> {
            /** 庄家最后一张牌 */
            let bankP = this.player(this.bankerUid);
            let bankLastcard = this.bottomCards.shift();
            let msg = {len: this.bottomCards.length};
            this.sendAll(Event.bottomCards, msg);
            this.foldsList.push({event: Event.bottomCards, msg: JSON.stringify(msg)});
            bankP.send(Event.bankLastcard, bankLastcard);
            bankP.sendAll(Event.bankLastcard, -1, true);
            this.foldsList.push({event: Event.bankLastcard, msg: bankLastcard});
            bankP.holds.unshift(bankLastcard);
            this.dealNextCheck(bankP, bankLastcard);
        });
    }

    dealNextCheck(bankP, bankLastcard) {
        this.changeStatus(Status.DRAWCARDWAIT);
        this.turn = this.uids.indexOf(this.bankerUid);
        this.sendNextTurnMsg();

        /** 检查胡 */
        let hu = this._algorithm.checkHu(bankP.holds);
        if (!!hu) {
            this.actions.push({
                uid: bankP.uid,
                auto: false,
                huType: HuType.zimo,
                t: ActionType.hu,
                huCard: bankLastcard
            });
        }

        /** 检查杠 */
        let gang = this._algorithm.checkGang(bankP.holds);
        if (!!gang) {
            this.actions.push({uid: bankP.uid, auto: false, data: gang, t: ActionType.gang});
        }

        /** 如果可以则先发送操作 */
        if (this.actions.length > 0) {
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

    nextDiscard() {
        this.changeStatus(Status.DISCARD);
        this.sendNextTurnMsg();
        let turnPlayer = this.players[this.turn];
        /** 计时自动出牌 */
        this.startTimeout(turnPlayer);
    }

    nextDrawCard(noNeedTurn) {
        this.changeStatus(Status.DRAWCARD);
        if (!!noNeedTurn) {} else {
            this.nextTurn();
        }

        this.sendNextTurnMsg();
        let turnPlayer = this.players[this.turn];
        if (!!this.lastDiscard) {
            /** 将上一张牌加入玩家出牌 */
            this.player(this.lastDiscard.uid).outs.push(this.lastDiscard.v);
            this.sendAll(Event.qiPai, this.lastDiscard);
            this.foldsList.push({event: Event.qiPai, msg: JSON.stringify(this.lastDiscard)});
            this.lastQiUid = this.lastDiscard.uid;
            this.sendAll(Event.lastQiPoker, this.lastQiUid);
            this.lastDiscard = undefined;
        }

        if (this.bottomCards.length <= 0) {
            /** 黄庄 */
            this.gameLiuju();
            return;
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
     * @param data
     */
    discard(turnPlayer, data) {
        if (this.status != Status.DISCARD) {
            this.send(turnPlayer.uid, Event.discardErr, '当前不是出牌状态');
            return;
        }

        if (this.turn !== turnPlayer.seatId) {
            this.send(turnPlayer.uid, Event.discardErr, '当前不是你出牌');
            return;
        }

        let card = data.v;
        let can = this._algorithm.checkCanOut(turnPlayer.holds, card);
        this.log(`出牌 player: ${turnPlayer.uid} card = ${card}`);
        if (!can) {
            this.send(turnPlayer.uid, Event.discardErr, '不可以出这一张牌');
            return;
        }

        this.changeStatus(Status.DISCARDWAIT);
        this.lastDiscard = {uid: turnPlayer.uid, v: card, idx: data.idx};
        this.sendAll(Event.discard, this.lastDiscard);
        this.foldsList.push({event: Event.discard, msg: JSON.stringify(this.lastDiscard)});
        turnPlayer.removeHolds([card]);
        /** 检查胡 */
        let nextp = this.getNextPlayer(turnPlayer);
        while (nextp.uid != turnPlayer.uid) {
            /** 有红中必须自摸 */
            if (!nextp.holds.includes(this._algorithm.laizi)) {
                let hu = this._algorithm.checkHu(nextp.holds, card);
                if (!!hu) {
                    this.actions.push({
                        uid: nextp.uid,
                        auto: false,
                        huType: HuType.dianpao,
                        t: ActionType.hu,
                        paoUid: turnPlayer.uid,
                        huCard: card
                    });
                }
            }

            nextp = this.getNextPlayer(nextp);
        }

        /** 检查杠碰 */
        for (let i = 0; i < this.players.length; i++) {
            let p = this.players[i];
            if (p.uid == turnPlayer.uid) {
                continue;
            }

            let gang = this._algorithm.checkGang(p.holds, [], card, true);
            if (!!gang) {
                this.actions.push({uid: p.uid, auto: false, data: gang, t: ActionType.gang});
            }
            let peng = this._algorithm.checkPeng(p.holds, card);
            if (!!peng) {
                this.actions.push({uid: p.uid, auto: false, data: peng, t: ActionType.peng});
                break;
            }
        }

        /** 找吃 只找下家
        nextp = this.getNextPlayer(turnPlayer);
        let chi = this._algorithm.checkChi(nextp.holds, card);
        if (chi) {
            this.actions.push({uid: nextp.uid, auto: false, data: chi, t: ActionType.chi});
        }
         */
        if (this.actions.length > 0) {
            /** 所有找完 有操作则发送操作 */
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
            let card = this.bottomCards.shift();
            this.log(`drawCard uid = ${turnPlayer.uid} v = ${card}`);
            let msg = {len: this.bottomCards.length};
            this.sendAll(Event.bottomCards, msg);
            this.foldsList.push({event: Event.bottomCards, msg: JSON.stringify(msg)});
            this.changeStatus(Status.DRAWCARDWAIT);
            /** 向所有人发送摸到的牌 */
            msg = {uid: turnPlayer.uid, v: card};
            turnPlayer.send(Event.drawCard, msg);
            turnPlayer.sendAll(Event.drawCard, {uid: turnPlayer.uid, v: -1}, true);
            this.foldsList.push({event: Event.drawCard, msg: JSON.stringify(msg)});

            /** 添加到手牌 */
            turnPlayer.holds.unshift(card);
            this.nextCheckDrarCard(turnPlayer, card);
        } else {
            /** 黄庄 */
            this.gameLiuju();
        }
    }

    /**
     * 摸牌之后检查
     * @param turnPlayer
     * @param card
     */
    nextCheckDrarCard(turnPlayer, card) {
        /** 检查胡 */
        let hu = this._algorithm.checkHu(turnPlayer.holds);
        if (!!hu) {
            this.actions.push({
                uid: turnPlayer.uid,
                auto: false,
                huType: HuType.zimo,
                t: ActionType.hu,
                huCard: card
            });
        }

        /** 检查杠 */
        let gang = this._algorithm.checkGang(turnPlayer.holds, turnPlayer.inPokers);
        if (!!gang) {
            this.actions.push({uid: turnPlayer.uid, auto: false, data: gang, t: ActionType.gang});
        }

        /** 检查补
         let bu = this._algorithm.checkBu(turnPlayer.holds, turnPlayer.inPokers, card);
         if (!!bu) {
                this.actions.push({uid: turnPlayer.uid, auto: false, data: gang, t: ActionType.gang});
            }
         */

        /** 所有找完 发送操作 */
        if (this.actions.length > 0) {
            this.sendActions();
        } else {
            /** 出牌 */
            this.setTimeout(()=> {
                this.nextDiscard();
            });
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
            let obj = {t: action.t, data: action.data};
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
                        if (action.t == ActionType.chi || action.t == ActionType.gang || action.t == ActionType.bu) {
                            let act = data.act;
                            if (isNaN(act)) {
                                this.send(uid, Event.toast, '操作错误');
                                return;
                            }
                            action.act = act;
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
            if (action.uid == p.uid) {
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
            if (!!this.gameIsHu) {
                this.gameOver();
                return;
            }

            /** 所有人都放弃了 如果是出牌等待 则下家摸牌 */
            if (this.status == Status.DISCARDWAIT) {
                this.nextDrawCard();
            }

            /** 所有人都放弃了 如果是摸牌等待 则当前玩家出牌 */
            else if (this.status == Status.DRAWCARDWAIT) {
                /** 如果是明杠 */
                if (!!this.mgData) {
                    /** 进喜钱 */
                    this.calculateGangScore(this.mgData);
                    /** 摸牌 */
                    this.setTimeout(()=> {
                        this.nextDrawCard(true);
                    });
                    /** 清除碰杠数据 */
                    this.mgData = undefined;
                } else {
                    this.nextDiscard();
                }
            }

            return;
        }

        /** 看顺位第一的是否是自动的 */
        let first = this.actions[0];
        if (!!first.auto) {
            if (!!this.gameIsHu) {
                this.actions.shift();
                if (first.t == ActionType.hu) {
                    /** 发送胡的动作 */
                    let msg = {uid: first.uid, huType: first.huType, paoUid: first.paoUid, idx: this.actionHus.length};
                    this.sendAll(Event.actionHu, msg);
                    this.actionHus.push(msg);
                    this.foldsList.push({event: Event.actionHu, msg: JSON.stringify(msg)});
                    this.setTimeout(()=> {
                        /** 胡牌 */
                        this.huPai(first);
                    });
                } else {
                    this.nextDoAction();
                }
                return;
            }

            if (first.t == ActionType.hu) {
                /** 发送胡的动作 */
                let msg = {uid: first.uid, huType: first.huType, paoUid: first.paoUid, idx: this.actionHus.length};
                this.sendAll(Event.actionHu, msg);
                this.actionHus.push(msg);
                this.foldsList.push({event: Event.actionHu, msg: JSON.stringify(msg)});
                this.actions.shift();
                this.setTimeout(()=> {
                    /** 胡牌 */
                    this.huPai(first);
                });
            } else {
                this.actions.length = 0;
                let from = !!this.lastDiscard ? this.lastDiscard.uid : undefined;
                this.lastDiscard = undefined;
                let p = this.player(first.uid);
                /** 吃 */
                if (first.t == ActionType.chi) {
                    /** 移除手牌里的吃牌 */
                    let act = first.act;
                    let obj = first.data[act];
                    let msg = {uid: first.uid, data: obj};
                    this.sendAll(Event.inPoker, msg);
                    this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});
                    /** 移除手牌里的两张 */
                    let vs = [].concat(obj.vs);
                    vs.shift();
                    p.removeHolds(vs);
                    p.inPokers.push(obj);
                    this.turn = this.uids.indexOf(first.uid);
                    this.nextDiscard();
                }
                /** 碰 */
                else if (first.t == ActionType.peng) {
                    let obj = first.data;
                    let msg = {uid: first.uid, data: obj};
                    this.sendAll(Event.inPoker, msg);
                    this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});
                    /** 移除手牌里的两张 */
                    p.removeHolds([obj.v, obj.v]);
                    p.inPokers.push(obj);
                    this.turn = this.uids.indexOf(first.uid);
                    this.nextDiscard();
                }
                /** 杠或者补 */
                else {
                    let act = first.act;
                    let obj = first.data[act];
                    let v = obj.v;
                    let needCheckInPoker = false;
                    if (first.t == ActionType.gang) {
                        let gt = obj.gt;
                        if (gt == GangType.an) {
                            p.removeHolds([v, v, v, v]);
                        } else if (gt == GangType.dian) {
                            p.removeHolds([v, v, v]);
                        } else {
                            p.removeHolds([v]);
                            needCheckInPoker = true;
                            this.mgData = {uid: first.uid, v: v, gt: gt, from: from};
                        }
                    } else {
                        needCheckInPoker = true;
                    }
                    /** 如果是明杠 或者 补 需要检查进牌 改变数据 不需要新增 */
                    if (needCheckInPoker) {
                        for (let i = 0; i < p.inPokers.length; i++) {
                            let inPoker = p.inPokers[i];
                            if (inPoker.v == v && inPoker.t == InPokerType.peng) {
                                p.inPokers[i] = obj;
                                break;
                            }
                        }
                    } else {
                        p.inPokers.push(obj);
                    }

                    let msg = {uid: first.uid, data: obj};
                    this.sendAll(Event.inPoker, msg);
                    this.foldsList.push({event: Event.inPoker, msg: JSON.stringify(msg)});
                    if (!!this.mgData) {
                        let turnPlayer = this.player(this.mgData.uid);
                        /** 检查胡 */
                        let nextp = this.getNextPlayer(turnPlayer);
                        while (nextp.uid != turnPlayer.uid) {
                            /** 有红中必须自摸 */
                            if (!nextp.holds.includes(this._algorithm.laizi)) {
                                let hu = this._algorithm.checkHu(nextp.holds, this.mgData.v);
                                if (!!hu) {
                                    this.actions.push({
                                        uid: nextp.uid,
                                        auto: false,
                                        huType: HuType.dianpao,
                                        t: ActionType.hu,
                                        paoUid: turnPlayer.uid,
                                        huCard: this.mgData.v
                                    });
                                }
                            }

                            nextp = this.getNextPlayer(nextp);
                        }

                        if (this.actions.length > 0) {
                            /** 所有找完 有操作则发送操作 */
                            this.sendActions();
                            return;
                        }
                    }

                    let scoreMsg = {uid: first.uid, gt: obj.gt, from: from};
                    this.calculateGangScore(scoreMsg);
                    /** 杠或补完之后要摸牌 */
                    this.setTimeout(()=> {
                        this.turn = this.uids.indexOf(first.uid);
                        this.nextDrawCard(true);
                    });

                    this.mgData = undefined;
                }
            }
        }
    }

    /**
     * 计算杠的分数
     * @param msg  杠动作
     */
    async calculateGangScore(msg) {
        let winUid = msg.uid;
        let gt = msg.gt;
        let winScore = 0;
        let loseObj = {};
        if (gt == GangType.an) {
            this.players.forEach(el=> {
                if (el.uid != winUid) {
                    let score = this.ante*10;
                    el.halfwayScore -= score;
                    loseObj[el.uid] = score;
                    winScore += score;
                }
            });
        } else if (gt == GangType.dian) {
            let from = msg.from;
            let losePlayer = this.player(from);
            if (!losePlayer) {
                return;
            }
            let score = this.ante*10;
            losePlayer.halfwayScore -= score;
            loseObj[losePlayer.uid] = score;
            winScore += score;
        } else {
            this.players.forEach(el=> {
                if (el.uid != winUid) {
                    let score = this.ante*5;
                    el.halfwayScore -= score;
                    loseObj[el.uid] = score;
                    winScore += score;
                }
            });
        }

        let winObj = {};
        winObj[winUid] = winScore;
        this.player(winUid).halfwayScore += winScore;
        let actual = await this.room.pushHalfwayScore(winObj, loseObj);
        this.sendAll(Event.gangScore, actual);
        this.foldsList.push({event: Event.gangScore, msg: JSON.stringify(actual)});
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
     * 玩家胡牌
     * @param action
     */
    huPai(action) {
        this.gameIsHu = true;
        this.huUids.push(action.uid);
        this.paoUid = action.paoUid;
        this.huCard = action.huCard;
        let winPlayer = this.player(action.uid);
        let msg = {uid: winPlayer.uid, holds: winPlayer.holds};
        this.otherHolds.push(msg);
        this.sendAll(Event.otherHolds, msg);
        if (!this.lastBanker) {
            this.lastBanker = winPlayer.uid;
            this.getLasting().lastBanker = this.lastBanker;
        }
        /** 扎鸟 */
        if (this.zhaniao > 0) {
            let niaoCards = [];
            if (this.bottomCards.length >= this.zhaniao) {
                niaoCards = niaoCards.concat(this.bottomCards.splice(0, this.zhaniao));
            } else {
                niaoCards = niaoCards.concat(this.bottomCards);
            }

            while (niaoCards.length < this.zhaniao) {
                niaoCards.push(this.huCard);
            }

            let objs = [];
            let huUidIdx = this.uids.indexOf(action.uid);
            for (let i = 0; i < niaoCards.length; i++) {
                let card = niaoCards[i];
                let obj = {card: card};
                if (card == this._algorithm.laizi) {
                    obj.uid = action.uid;
                } else {
                    let idx = huUidIdx+(card%10)%this.uids.length-1;
                    while (idx < 0) {
                        idx += this.uids.length;
                    }
                    obj.uid = this.uids[idx%this.uids.length];
                }

                objs.push(obj);
            }

            winPlayer.zhaniao = objs;
            this.sendAll(Event.zhaniao, objs);
            this.foldsList.push({event: Event.zhaniao, msg: objs});
        }

        /** 如果是点炮 */
        if (!!this.paoUid) {
            /** 计算输赢分数 */
            this.players.forEach(el => {
                if (el.uid == this.paoUid) {
                    let fan = 1;
                    winPlayer.zhaniao.forEach(obj=> {
                        if (obj.uid == winPlayer.uid || obj.uid == el.uid) {
                            //fan+=1;
                            fan*=2;
                        }
                    });
                    let score = this.ante*fan;
                    el.score -= score;
                    winPlayer.score += score;
                }
            });
        } else {
            this.players.forEach(el => {
                if (el.uid != winPlayer.uid) {
                    let fan = 1;
                    winPlayer.zhaniao.forEach(obj=> {
                        if (obj.uid == winPlayer.uid || obj.uid == el.uid) {
                            //fan+=1;
                            fan*=2;
                        }
                    });

                    let score = this.ante*fan;
                    el.score -= score;
                    winPlayer.score += score;
                }
            });
        }

        this.setTimeout(()=> {
            if (!!this.duo_pao) {
                this.nextDoAction(true);
            } else {
                this.gameOver();
            }
        }, this.zhaniao > 0 ? 3000 : 100);
    }

    /**
     * 游戏结束
     */
    gameOver() {
        if (this._gameEnd) {
            return;
        }

        this.actions.length = 0;
        this._gameEnd = true;
        this.changeStatus(Status.SETTLE);
        this.setTimeout(()=> {
            this.calculateResult();
        }, 2000);
    }

    gameLiuju() {
        if (this._gameEnd) {
            return;
        }

        this._gameEnd = true;
        this.changeStatus(Status.SETTLE);
        this.sendAll(Event.liuju);
        this.setTimeout(()=> {
            this.calculateResult();
        }, 2000);
    }

    /**
     * 计算结果
     */
    async calculateResult() {
        /** 上传分数 */
        let actualScores = await this.pushScore();
        let msg = {
            scores: actualScores,
            banker: this.bankerUid,
            bottomCards: this.bottomCards,
            leftCards: this.leftCards,
            huUids: this.huUids,
            paoUid: this.paoUid,
            huCard: this.huCard,
        };

        let playerDatas = {};
        for (let i = 0; i < this.players.length; i++) {
            let el = this.players[i];
            let uid = el.uid;
            let obj = {};
            obj.halfwayScore = el.halfwayScore;
            obj.inPokers = el.inPokers;
            obj.holds = el.holds;
            obj.zhaniao = el.zhaniao;
            playerDatas[uid] = obj;
        }

        msg.playerDatas = playerDatas;
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
        // return;
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
            case Status.DISCARD:
                this._autoTimeout = this.setTimeout(() => {
                    let card = this.autoDiscard(turnPlayer);
                    this.discard(turnPlayer, card);
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
            actionHus: this.actionHus,
            otherHolds: this.otherHolds,
            lastQiUid: this.lastQiUid,
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
            bottomCards: this.oriBottomCards,
        };

        this.players.forEach((player, index) => {
            history[player.uid] = {
                score: player.score,
                halfScore: player.halfScore,
                holds: player.beginHolds,
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